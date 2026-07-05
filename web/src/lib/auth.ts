import "@/lib/env";
import process from "node:process";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
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

export const auth = betterAuth({
  database: db,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
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
  plugins: [admin()],
});
