import "@/lib/env";
import process from "node:process";
import { type BetterAuthPlugin, betterAuth } from "better-auth";
import { mcp } from "@better-auth/mcp";
import { admin, captcha, jwt } from "better-auth/plugins";
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

/** MCP サーバーの保護リソース識別子（アクセストークンの audience）。 */
export const MCP_RESOURCE = new URL("/api/mcp", baseURL).href;

// @better-auth/mcp のプラグイン型は OpenAPI メタデータに `items?: undefined` 等を含み、
// このプロジェクトの exactOptionalPropertyTypes と両立しない（ライブラリ側の型の問題）。
// サーバー側で oauth 系エンドポイントを auth.api から型付きで呼ばないため、ここだけ
// BetterAuthPlugin として受ける（クライアントの型は oauthProviderClient が持つ）。
const mcpPlugin = mcp({
  loginPage: "/login",
  consentPage: "/oauth/consent",
  resource: MCP_RESOURCE,
  allowDynamicClientRegistration: true,
  allowUnauthenticatedClientRegistration: true,
}) as unknown as BetterAuthPlugin;

export const auth = betterAuth({
  database: db,
  baseURL,
  secret: secret ?? "dev-only-insecure-secret-not-for-production",
  basePath: "/api/auth",
  // jwt プラグインの /token（セッション→JWT 交換）は使わないため無効化する（oauth-provider 推奨）。
  disabledPaths: ["/token"],
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
  // mcp: MCP クライアント（Claude 等）向けの OAuth 2.1 認可サーバー（@better-auth/mcp）。
  // 動的クライアント登録＋PKCE。未ログインなら /login、未同意なら /oauth/consent へ
  // 署名付きクエリで送る。アクセストークンは MCP_RESOURCE を audience とする JWT（jwt
  // プラグインの JWKS で署名）で、/api/mcp の requireMcpAuth が検証する。
  // DCR では skip_consent を指定できないため、利用者の同意なしにコードは発行されない。
  plugins: [
    admin(),
    // MCP アクセストークンの署名鍵（JWKS）用。既定ではセッション確認のたびに JWT を署名して
    // set-auth-jwt ヘッダに載せるため、全ページで鍵の復号が走り、シークレット変更時には
    // ログイン確認ごと壊れる。この機能は使わないので無効化する（oauth-provider 推奨設定）。
    jwt({ disableSettingJwtHeader: true }),
    mcpPlugin,
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
