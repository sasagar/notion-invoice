import { LoginForm } from "@/components/login-form";
import { getServerSession } from "@/lib/session";
import { unstable_redirect } from "waku/router/server";

export default async function LoginPage({ query }: { query: string }) {
  // ログイン済みでログイン画面を出す意味はないので一覧へ。ただし MCP の OAuth 認可から
  // 来た場合（署名付きクエリ sig 付き）はフォームを出し、ログイン後に認可を再開させる。
  const session = await getServerSession();
  if (session && !new URLSearchParams(query).has("sig")) {
    unstable_redirect("/invoice/list/1");
  }
  return (
    <div className="mx-auto max-w-md py-8">
      <div className="rounded-lg border border-paper-line bg-white/70 p-8 dark:border-slate-800 dark:bg-slate-900/40">
        <h1 className="mb-6 font-display text-2xl font-bold text-kent-blue-500 dark:text-kent-blue-200">
          ログイン
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}

export const getConfig = async () => ({ render: "dynamic" as const });
