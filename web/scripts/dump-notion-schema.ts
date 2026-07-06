/**
 * Notion のデータベース定義（プロパティ・formula式・select/status選択肢・
 * relation先）を、登録済み資格情報で再帰的にダンプする読み取り専用スクリプト。
 *
 * 脱Notion移行のスキーマ設計に必要な「コードから見えない情報」
 * （formula定義・ステータス/税率の全選択肢・品目マスタDBの構造）を
 * 正確に把握するために使う。
 *
 * 実行: pnpm run notion:schema
 */
import process from "node:process";
import { Client } from "@notionhq/client";
import { getCredentials } from "../src/lib/credentials";
import { db } from "../src/lib/db";

function asRecord(v: unknown): Record<string, unknown> | null {
  return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : null;
}

function plain(title: unknown): string {
  if (!Array.isArray(title)) {
    return "";
  }
  return title.map((t) => String(asRecord(t)?.["plain_text"] ?? "")).join("");
}

/** プロパティ型ごとの「中身」（formula式・選択肢等）を取り出す。 */
function propDetail(prop: Record<string, unknown>): unknown {
  const type = String(prop["type"] ?? "");
  const body = asRecord(prop[type]);
  if (!body) {
    return undefined;
  }
  switch (type) {
    case "formula":
      return { expression: body["expression"] };
    case "select":
    case "multi_select":
    case "status": {
      const options = Array.isArray(body["options"])
        ? (body["options"] as unknown[]).map((o) => String(asRecord(o)?.["name"] ?? ""))
        : [];
      const groups = Array.isArray(body["groups"])
        ? (body["groups"] as unknown[]).map((g) => {
            const gr = asRecord(g);
            return {
              name: gr?.["name"],
              option_ids_count: (gr?.["option_ids"] as unknown[])?.length,
            };
          })
        : undefined;
      return groups ? { options, groups } : { options };
    }
    case "relation":
      return {
        data_source_id: body["data_source_id"],
        database_id: body["database_id"],
        type: body["type"],
      };
    case "rollup":
      return {
        relation_property_name: body["relation_property_name"],
        rollup_property_name: body["rollup_property_name"],
        function: body["function"],
      };
    case "number":
      return { format: body["format"] };
    default:
      // title/rich_text/date/checkbox/files 等は中身の設定が無いか重要でない
      return Object.keys(body).length > 0 ? body : undefined;
  }
}

async function dumpDataSource(
  notion: Client,
  dataSourceId: string,
  visited: Set<string>,
  queue: string[],
): Promise<void> {
  if (visited.has(dataSourceId)) {
    return;
  }
  visited.add(dataSourceId);

  const ds = asRecord(await notion.dataSources.retrieve({ data_source_id: dataSourceId }));
  const title = plain(ds?.["title"]) || plain(asRecord(ds?.["parent"])?.["title"]) || "(無題)";
  console.log(`\n${"=".repeat(70)}`);
  console.log(`## データソース: ${title}`);
  console.log(`   id: ${dataSourceId}`);
  console.log("=".repeat(70));

  const properties = asRecord(ds?.["properties"]) ?? {};
  for (const [name, rawProp] of Object.entries(properties)) {
    const prop = asRecord(rawProp);
    if (!prop) {
      continue;
    }
    const type = String(prop["type"] ?? "?");
    const detail = propDetail(prop);
    const detailStr = detail !== undefined ? ` ${JSON.stringify(detail, null, 0)}` : "";
    console.log(`- ${name} [${type}]${detailStr}`);

    // relation 先を探索キューへ（品目マスタ等、未知のDBを自動発見する）
    if (type === "relation") {
      const rel = asRecord(prop["relation"]);
      const target = rel?.["data_source_id"] ?? rel?.["database_id"];
      if (typeof target === "string" && !visited.has(target)) {
        queue.push(target);
      }
    }
  }
}

// --- main ---
const row = db.prepare("SELECT user_id FROM notion_credentials LIMIT 1").get() as
  | { user_id: string }
  | undefined;
if (!row) {
  console.error("notion_credentials にレコードがありません（資格情報未登録）。");
  process.exit(1);
}
const creds = getCredentials(row.user_id);
if (!creds) {
  console.error("資格情報の復号に失敗しました。");
  process.exit(1);
}

const notion = new Client({ auth: creds.apiKey });

// 起点: 登録済み請求書DB → data_source を解決
const database = asRecord(await notion.databases.retrieve({ database_id: creds.dbId }));
console.log(`# Notion スキーマダンプ`);
console.log(`起点データベース: ${plain(database?.["title"])} (${creds.dbId})`);

const sources = database?.["data_sources"];
const first = Array.isArray(sources) ? asRecord(sources[0]) : null;
const rootDataSourceId = typeof first?.["id"] === "string" ? (first["id"] as string) : creds.dbId;

const visited = new Set<string>();
const queue: string[] = [rootDataSourceId];
while (queue.length > 0) {
  const next = queue.shift();
  if (next) {
    try {
      await dumpDataSource(notion, next, visited, queue);
    } catch (e) {
      console.error(`\n!! ${next} の取得に失敗:`, e instanceof Error ? e.message : e);
      console.error("   (このDBがインテグレーションに共有されていない可能性があります)");
    }
  }
}

console.log(`\n完了: ${visited.size} 個のデータソースをダンプしました。`);
process.exit(0);
