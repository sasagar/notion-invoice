import process from "node:process";
import { getMigrations } from "better-auth/db/migration";
import { auth } from "../src/lib/auth";
import { db } from "../src/lib/db";
import { applyAppSchema } from "../src/lib/schema";

// better-auth 1.6 の mcp プラグインが作った旧 OAuth 表。1.7 の @better-auth/mcp
// （oauth-provider）は oauthAccessToken / oauthConsent を同名・別構成で使うため、
// 旧構成のまま残っていると移行が壊れる。旧表が空の場合だけ削除し、行があれば中止する
// （発行済みトークン等を黙って消さない。MCP クライアントは再接続すれば済む）。
const LEGACY_OAUTH_TABLES = ["oauthApplication", "oauthAccessToken", "oauthConsent"] as const;

function hasTable(name: string): boolean {
  return (
    db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(name) !==
    undefined
  );
}

function hasColumn(table: string, column: string): boolean {
  return (db.prepare(`PRAGMA table_info("${table}")`).all() as { name: string }[]).some(
    (c) => c.name === column,
  );
}

/** 旧 mcp プラグインの表が残っていれば（空のときだけ）削除する。 */
function dropLegacyOAuthTables(): void {
  // 旧構成の目印: oauthApplication 表、または oauthAccessToken.accessToken 列。
  const legacy =
    hasTable("oauthApplication") ||
    (hasTable("oauthAccessToken") && hasColumn("oauthAccessToken", "accessToken"));
  if (!legacy) {
    return;
  }
  const present = LEGACY_OAUTH_TABLES.filter(hasTable);
  const nonEmpty = present.filter(
    (t) => (db.prepare(`SELECT count(*) AS c FROM "${t}"`).get() as { c: number }).c > 0,
  );
  if (nonEmpty.length > 0) {
    console.error(
      `✗ 旧 MCP OAuth 表にデータがあります: ${nonEmpty.join(", ")}。` +
        "内容を確認し、不要なら削除してから再実行してください。",
    );
    process.exit(1);
  }
  db.transaction(() => {
    for (const t of present) {
      db.exec(`DROP TABLE "${t}"`);
    }
  })();
  console.log(`✓ 旧 MCP OAuth 表を削除: ${present.join(", ")}`);
}

dropLegacyOAuthTables();

const { runMigrations } = await getMigrations(auth.options);
await runMigrations();
console.log("✓ better-auth migrations applied");

// アプリ表は user を FK 参照するため、better-auth migration の後に適用する。
applyAppSchema(db);
console.log("✓ app schema applied");
process.exit(0);
