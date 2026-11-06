import { Link } from "waku";
import { Card } from "@/components/card";
import { AccountForm } from "@/components/masters/account-form";
import { ArchiveButton } from "@/components/masters/archive-button";
import { MastersHeading } from "@/components/masters/masters-heading";
import { NewRecordPanel } from "@/components/masters/new-record-panel";
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
      <div className="max-w-3xl">
        <MastersHeading title="自社マスタ" breadcrumb={breadcrumb} />
        <MastersNotice />
      </div>
    );
  }
  const all = listAccountRecords(db, session.user.id);
  const records = all.filter((r) => r.archivedAt === null);
  const archived = all.filter((r) => r.archivedAt !== null);
  return (
    <div className="max-w-3xl">
      <MastersHeading title="自社マスタ" breadcrumb={breadcrumb} />
      <NewRecordPanel open={records.length === 0}>
        <AccountForm />
      </NewRecordPanel>
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
                    {/* 主表示は担当者名（エディタの選択ラベルと同じ表示名） */}
                    <p className="font-medium">{r.contactName || r.companyName}</p>
                    <p className="truncate text-xs text-stone-500 dark:text-slate-400">
                      {r.contactName && <span>{r.companyName}</span>}
                      {r.slug && <span className="font-mono">　{r.slug}</span>}
                      {r.registrationNumber && (
                        <span className="font-mono">　{r.registrationNumber}</span>
                      )}
                    </p>
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
                  <Link to={`/masters/accounts/${r.id}`} className="min-w-0 flex-1">
                    <p className="font-medium text-stone-500 dark:text-slate-400">
                      {r.contactName || r.companyName}
                    </p>
                    {/* 行名変更前の振込先と見分けられるよう、銀行情報の先頭行を出す */}
                    {r.bankInfo && (
                      <p className="truncate text-xs text-stone-500 dark:text-slate-400">
                        {r.bankInfo.split("\n")[0]}
                      </p>
                    )}
                    {r.archivedAt && (
                      <p className="font-mono text-xs text-stone-400 dark:text-slate-500">
                        アーカイブ: {r.archivedAt}
                      </p>
                    )}
                  </Link>
                  <ArchiveButton kind="accounts" id={r.id} archived={true} />
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
