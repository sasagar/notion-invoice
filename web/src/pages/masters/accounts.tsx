import { Link } from "waku";
import { Card, SectionHeading } from "@/components/card";
import { AccountForm } from "@/components/masters/account-form";
import { MastersHeading } from "@/components/masters/masters-heading";
import { MastersNotice } from "@/components/masters/masters-notice";
import { isSqliteBackend } from "@/lib/data/backend";
import { db } from "@/lib/db";
import { listAccountRecords } from "@/lib/repository";
import { requireSession } from "@/lib/session";

const breadcrumb = <Link to="/masters">← マスタ管理</Link>;

export default async function MastersAccountsPage() {
  const session = await requireSession();
  if (!isSqliteBackend()) {
    return (
      <div className="mx-auto max-w-3xl">
        <MastersHeading title="自社マスタ" breadcrumb={breadcrumb} />
        <MastersNotice />
      </div>
    );
  }
  const records = listAccountRecords(db, session.user.id);
  return (
    <div className="mx-auto max-w-3xl">
      <MastersHeading title="自社マスタ" breadcrumb={breadcrumb} />
      <Card className="mb-4">
        <SectionHeading>新規追加</SectionHeading>
        <AccountForm />
      </Card>
      {records.length === 0 ? (
        <p className="rounded-lg border border-paper-line bg-white/60 p-6 text-center text-sm text-stone-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
          自社情報がありません。
        </p>
      ) : (
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-paper-line dark:divide-slate-800">
            {records.map((r) => (
              <li key={r.id}>
                <Link
                  to={`/masters/accounts/${r.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-kent-blue-500/5 dark:hover:bg-kent-blue-400/5"
                >
                  {r.sealImageUrl && (
                    <img
                      src={r.sealImageUrl}
                      alt="印影"
                      className="h-10 w-10 shrink-0 object-contain"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{r.companyName}</p>
                    {r.registrationNumber && (
                      <p className="font-mono text-xs text-stone-500 dark:text-slate-400">
                        {r.registrationNumber}
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
    </div>
  );
}

export const getConfig = async () => ({ render: "dynamic" as const });
