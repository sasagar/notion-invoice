"use client";

import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// baseURL は指定しない。相対値('/api/auth')は SSR/モジュール初期化時に
// new URL() が throw し、[SSR Error] とログインフォーム非SSRの原因になる。
// ブラウザでは window.origin + 既定 basePath('/api/auth') に解決され、
// サーバの basePath と一致する。
export const authClient = createAuthClient({
  plugins: [adminClient()],
});
