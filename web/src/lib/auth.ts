import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import Database from "better-sqlite3";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";

// .env があれば読み込む（開発・スクリプト用）。本番は実環境変数を使う。
try {
  process.loadEnvFile();
} catch {
  // .env が無い場合は無視
}

const isProduction = process.env.NODE_ENV === "production";

// シークレットは本番で必須（32文字以上）。既知の固定値へフォールバックさせず、
// 未設定/短い場合は起動を失敗させる（セッション偽造の fail-open を防ぐ）。
const secret = process.env.BETTER_AUTH_SECRET;
if (isProduction && (!secret || secret.length < 32)) {
  throw new Error(
    "BETTER_AUTH_SECRET is required in production (32+ chars). " +
      "Generate one with: openssl rand -base64 32",
  );
}

const dbPath = process.env.DATABASE_PATH ?? "data/app.sqlite";
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
// 資格情報・セッションを含むDBファイルの権限をオーナーのみに制限。
try {
  fs.chmodSync(dbPath, 0o600);
} catch {
  // chmod 非対応環境は無視
}

export const auth = betterAuth({
  database: db,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  // 本番未設定時は上で throw 済み。dev のみ弱いシークレットを許容。
  secret: secret ?? "dev-only-insecure-secret-not-for-production",
  basePath: "/api/auth",
  emailAndPassword: {
    enabled: true,
    // 自己サインアップは無効。ユーザーは管理者が admin プラグインで発行する。
    disableSignUp: true,
  },
  // 本番は Secure クッキーを強制（公開HTTPS配下で安全側）。
  advanced: {
    useSecureCookies: isProduction,
  },
  // レート制限を明示有効化（総当たり対策。sign-in は既定で厳しめ）。
  rateLimit: {
    enabled: true,
  },
  plugins: [admin()],
});
