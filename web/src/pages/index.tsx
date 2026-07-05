import { Link } from "waku";

export default async function HomePage() {
  return (
    <div className="mx-auto max-w-2xl py-16 text-center">
      <h1 className="mb-4 text-3xl font-bold">BKTSK Notion Invoice</h1>
      <p className="mb-8 text-stone-500 dark:text-slate-400">
        Notion をデータソースにした請求書・見積書の管理と PDF 出力。
      </p>
      <Link
        to="/login"
        className="inline-block rounded-lg bg-kent-blue-500 px-6 py-3 text-white transition hover:bg-kent-blue-600"
      >
        ログイン
      </Link>
    </div>
  );
}

export const getConfig = async () => ({ render: "static" as const });
