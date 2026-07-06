import { Link } from "waku";
import { Card, SectionHeading } from "@/components/card";
import { ItemForm } from "@/components/masters/item-form";
import { MastersHeading } from "@/components/masters/masters-heading";
import { MastersNotice } from "@/components/masters/masters-notice";
import { isSqliteBackend } from "@/lib/data/backend";
import { db } from "@/lib/db";
import { formatYen } from "@/lib/format";
import { listItems } from "@/lib/repository";
import { requireSession } from "@/lib/session";

const breadcrumb = <Link to="/masters">← マスタ管理</Link>;

export default async function MastersItemsPage() {
  const session = await requireSession();
  if (!isSqliteBackend()) {
    return (
      <div className="mx-auto max-w-3xl">
        <MastersHeading title="項目マスタ" breadcrumb={breadcrumb} />
        <MastersNotice />
      </div>
    );
  }
  const records = listItems(db, session.user.id);
  return (
    <div className="mx-auto max-w-3xl">
      <MastersHeading title="項目マスタ" breadcrumb={breadcrumb} />
      <Card className="mb-4">
        <SectionHeading>新規追加</SectionHeading>
        <ItemForm />
      </Card>
      {records.length === 0 ? (
        <p className="rounded-lg border border-paper-line bg-white/60 p-6 text-center text-sm text-stone-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
          項目がありません。
        </p>
      ) : (
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-paper-line dark:divide-slate-800">
            {records.map((r) => (
              <li key={r.id}>
                <Link
                  to={`/masters/items/${r.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-kent-blue-500/5 dark:hover:bg-kent-blue-400/5"
                >
                  <span className="min-w-0 flex-1 font-medium">{r.name}</span>
                  <span className="font-mono tabular-nums text-stone-600 dark:text-slate-300">
                    {formatYen(r.unitPrice)}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-stone-400 dark:text-slate-500">
                    編集 →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

export const getConfig = async () => ({ render: "dynamic" as const });
