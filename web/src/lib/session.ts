import { unstable_getHeaders, unstable_redirect } from "waku/router/server";
import { auth } from "@/lib/auth";

/**
 * 現在のリクエストのセッションを取得する（未ログインなら null）。
 * RSC / サーバー関数から呼ぶ。better-auth の getSession はDB照合で検証する。
 */
export async function getServerSession() {
  return auth.api.getSession({
    headers: new Headers(unstable_getHeaders()),
  });
}

/**
 * セッション必須。未ログインなら /login へリダイレクト（unstable_redirect は throw）。
 */
export async function requireSession() {
  const session = await getServerSession();
  if (!session) {
    unstable_redirect("/login");
  }
  return session;
}
