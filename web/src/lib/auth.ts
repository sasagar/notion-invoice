import "@/lib/env";
import process from "node:process";
import { betterAuth } from "better-auth";
import { admin, captcha, mcp } from "better-auth/plugins";
import { db } from "@/lib/db";

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

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export const auth = betterAuth({
  database: db,
  baseURL,
  secret: secret ?? "dev-only-insecure-secret-not-for-production",
  basePath: "/api/auth",
  emailAndPassword: {
    enabled: true,
    // 自己サインアップは無効。ユーザーは管理者が admin プラグインで発行する。
    disableSignUp: true,
  },
  advanced: {
    useSecureCookies: isProduction,
  },
  rateLimit: {
    enabled: true,
  },
  // Turnstile captcha は TURNSTILE_SECRET_KEY がある時のみ有効化。
  // 保護対象は better-auth 既定(/sign-in/email 等)。トークンは
  // クライアントが x-captcha-response ヘッダで送る。
  // mcp: MCP クライアント（Claude 等）向けの OAuth 2.1 認可サーバー
  // （動的クライアント登録・PKCE）。未ログインなら /login へ送り、ログイン後に
  // 認可フローを再開する。発行トークンは /api/mcp の withMcpAuth で検証する。
  plugins: [
    admin(),
    mcp({ loginPage: "/login", resource: new URL("/api/mcp", baseURL).href }),
    ...(process.env.TURNSTILE_SECRET_KEY
      ? [
          captcha({
            provider: "cloudflare-turnstile",
            secretKey: process.env.TURNSTILE_SECRET_KEY,
          }),
        ]
      : []),
  ],
});
