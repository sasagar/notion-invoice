"use client";

import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// baseURL は指定しない。相対値('/api/auth')は SSR/モジュール初期化時に
// new URL() が throw し、[SSR Error] とログインフォーム非SSRの原因になる。
// ブラウザでは window.origin + 既定 basePath('/api/auth') に解決され、
// サーバの basePath と一致する。
// oauthProviderClient: MCP の OAuth 認可中（URL に署名付きクエリ sig がある間）、
// サインイン/同意のリクエストに oauth_query を自動添付し、認可フローを再開させる。
export const authClient = createAuthClient({
  plugins: [adminClient(), oauthProviderClient()],
});
