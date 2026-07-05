import { NotionSettingsForm } from "@/components/notion-settings-form";
import { hasCredentials } from "@/lib/credentials";
import { requireSession } from "@/lib/session";

export default async function UserPage() {
  const session = await requireSession();
  const hasCreds = hasCredentials(session.user.id);
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold mb-6">設定</h1>
      <section>
        <h2 className="text-lg font-bold mb-3">Notion 連携</h2>
        <NotionSettingsForm hasCreds={hasCreds} />
      </section>
    </main>
  );
}

export const getConfig = async () => ({ render: "dynamic" as const });
