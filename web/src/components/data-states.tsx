import { Link } from "waku";

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/40">
      <p className="font-medium">Notion からデータを取得できませんでした。</p>
      <p className="mt-1 text-sm text-stone-600 dark:text-slate-400">{message}</p>
      <Link
        to="/user"
        className="mt-4 inline-block rounded-lg bg-kent-blue-500 px-4 py-2 text-sm text-white hover:bg-kent-blue-600"
      >
        Notion 連携設定を確認
      </Link>
    </div>
  );
}
