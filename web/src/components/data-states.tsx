import { Link } from "waku";

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-shuiro-300 bg-shuiro-50 p-6 dark:border-shuiro-700 dark:bg-shuiro-700/10">
      <p className="font-medium text-shuiro-700 dark:text-shuiro-400">
        Notion からデータを取得できませんでした。
      </p>
      <p className="mt-1 text-sm text-stone-600 dark:text-slate-400">{message}</p>
      <Link
        to="/user"
        className="mt-4 inline-block rounded-sm bg-kent-blue-500 px-4 py-2 text-sm text-white hover:bg-kent-blue-600"
      >
        Notion 連携設定を確認
      </Link>
    </div>
  );
}
