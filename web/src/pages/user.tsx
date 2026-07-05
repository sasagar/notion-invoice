import { NotionSettingsForm } from "@/components/notion-settings-form";
import { hasCredentials } from "@/lib/credentials";
import { requireSession } from "@/lib/session";

export default async function UserPage() {
  const session = await requireSession();
  const hasCreds = hasCredentials(session.user.id);
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">設定</h1>
      <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-1 text-lg font-bold">Notion 連携</h2>
        <p className="mb-4 text-sm text-stone-500 dark:text-slate-400">
          Notion のデータベース ID と API
          キーを登録します。値は暗号化して保存され、画面には再表示されません。
        </p>
        <NotionSettingsForm hasCreds={hasCreds} />
      </section>
    </div>
  );
}

export const getConfig = async () => ({ render: "dynamic" as const });
