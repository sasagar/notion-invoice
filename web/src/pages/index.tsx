import { Link } from "waku";
import { getServerSession } from "@/lib/session";
import { unstable_redirect } from "waku/router/server";

export default async function HomePage() {
  // ログイン済みならランディング（ログイン誘導）ではなく一覧へ。
  const session = await getServerSession();
  if (session) {
    unstable_redirect("/invoice/list/1");
  }
  return (
    <div className="mx-auto max-w-2xl py-16 text-center">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-stone-400 dark:text-slate-500">
        Notion 連携 請求書・見積書管理
      </p>
      <h1 className="mb-4 font-display text-4xl font-bold text-kent-blue-500 dark:text-kent-blue-200">
        BKTSK Notion Invoice
      </h1>
      <p className="mb-8 text-stone-500 dark:text-slate-400">
        Notion をデータソースにした請求書・見積書の管理と PDF 出力。
      </p>
      <Link
        to="/login"
        className="inline-block rounded-sm bg-kent-blue-500 px-6 py-3 text-white transition hover:bg-kent-blue-600"
      >
        ログイン
      </Link>
    </div>
  );
}

export const getConfig = async () => ({ render: "dynamic" as const });
