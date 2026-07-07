import { Link } from "waku";
import { Card, SectionHeading } from "@/components/card";
import { CustomerForm } from "@/components/masters/customer-form";
import { MastersHeading } from "@/components/masters/masters-heading";
import { MastersNotice } from "@/components/masters/masters-notice";
import { isSqliteBackend } from "@/lib/data/backend";
import { db } from "@/lib/db";
import { CustomerArchiveButton } from "@/components/masters/customer-archive-button";
import { listCustomerRecords } from "@/lib/repository";
import { requireSession } from "@/lib/session";

const breadcrumb = <Link to="/masters">← マスタ管理</Link>;

export default async function MastersCustomersPage() {
  const session = await requireSession();
  if (!isSqliteBackend()) {
    return (
      <div className="mx-auto max-w-3xl">
        <MastersHeading title="顧客マスタ" breadcrumb={breadcrumb} />
        <MastersNotice />
      </div>
    );
  }
  const records = listCustomerRecords(db, session.user.id);
  const active = records.filter((r) => r.archivedAt === null);
  const archived = records.filter((r) => r.archivedAt !== null);
  return (
    <div className="mx-auto max-w-3xl">
      <MastersHeading title="顧客マスタ" breadcrumb={breadcrumb} />
      <Card className="mb-4">
        <SectionHeading>新規追加</SectionHeading>
        <CustomerForm />
      </Card>
      {active.length === 0 ? (
        <p className="rounded-lg border border-paper-line bg-white/60 p-6 text-center text-sm text-stone-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
          顧客がありません。
        </p>
      ) : (
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-paper-line dark:divide-slate-800">
            {active.map((r) => (
              <li key={r.id}>
                <Link
                  to={`/masters/customers/${r.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-kent-blue-500/5 dark:hover:bg-kent-blue-400/5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {r.companyName || r.name} {r.honorific}
                    </p>
                    {r.contactName && (
                      <p className="text-sm text-stone-500 dark:text-slate-400">
                        担当: {r.contactName}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 font-mono text-xs text-stone-400 dark:text-slate-500">
                    編集 →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {archived.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-stone-500 dark:text-slate-400">
            アーカイブ済み（{archived.length} 件）
          </summary>
          <Card className="mt-2 overflow-hidden p-0 opacity-80">
            <ul className="divide-y divide-paper-line dark:divide-slate-800">
              {archived.map((r) => (
                <li key={r.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-stone-500 dark:text-slate-400">
                      {r.companyName || r.name} {r.honorific}
                    </p>
                    {r.archivedAt && (
                      <p className="font-mono text-xs text-stone-400 dark:text-slate-500">
                        アーカイブ: {r.archivedAt}
                      </p>
                    )}
                  </div>
                  <CustomerArchiveButton id={r.id} archived={true} />
                </li>
              ))}
            </ul>
          </Card>
        </details>
      )}
    </div>
  );
}

export const getConfig = async () => ({ render: "dynamic" as const });
