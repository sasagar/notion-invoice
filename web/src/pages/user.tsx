import { Link } from "waku";
import { NotionSettingsForm } from "@/components/notion-settings-form";
import { hasCredentials } from "@/lib/credentials";
import { isSqliteBackend } from "@/lib/data/backend";
import { requireSession } from "@/lib/session";

export default async function UserPage() {
  const session = await requireSession();
  const sqlite = isSqliteBackend();
  const hasCreds = hasCredentials(session.user.id);
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-display text-2xl font-bold text-kent-blue-500 dark:text-kent-blue-200">
        設定
      </h1>
      {sqlite ? (
        <section className="rounded-lg border border-paper-line bg-white/70 p-6 dark:border-slate-800 dark:bg-slate-900/40">
          <h2 className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-stone-500 dark:text-slate-400">
            データソース
          </h2>
          <p className="text-sm text-stone-600 dark:text-slate-300">
            このアプリ内のデータベース（SQLite）で動作しています。請求書・顧客・自社情報・項目は
            アプリ内で直接編集できます。
          </p>
          <p className="mt-2 text-sm text-stone-500 dark:text-slate-400">
            Notion 連携の設定は、読み取り元が Notion のとき（DATA_BACKEND 未設定）のみ表示されます。
          </p>
          <Link
            to="/masters"
            className="mt-4 inline-block rounded-sm bg-kent-blue-500 px-4 py-2 text-sm text-white transition hover:bg-kent-blue-600"
          >
            マスタ管理へ
          </Link>
        </section>
      ) : (
        <section className="rounded-lg border border-paper-line bg-white/70 p-6 dark:border-slate-800 dark:bg-slate-900/40">
          <h2 className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-stone-500 dark:text-slate-400">
            Notion 連携
          </h2>
          <p className="mb-4 text-sm text-stone-500 dark:text-slate-400">
            Notion のデータベース ID と API
            キーを登録します。値は暗号化して保存され、画面には再表示されません。
          </p>
          <NotionSettingsForm hasCreds={hasCreds} />
        </section>
      )}
    </div>
  );
}

export const getConfig = async () => ({ render: "dynamic" as const });
