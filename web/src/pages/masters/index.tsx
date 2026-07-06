import { Link } from "waku";
import { MastersHeading } from "@/components/masters/masters-heading";
import { MastersNotice } from "@/components/masters/masters-notice";
import { isSqliteBackend } from "@/lib/data/backend";
import { requireSession } from "@/lib/session";

const sections = [
  { to: "/masters/customers", label: "顧客マスタ", desc: "請求先の顧客・社名・敬称・会社情報" },
  { to: "/masters/accounts", label: "自社マスタ", desc: "請求元の会社情報・銀行情報・印影" },
  { to: "/masters/items", label: "項目マスタ", desc: "項目名と単価（税抜）" },
] as const;

export default async function MastersIndexPage() {
  await requireSession();
  return (
    <div className="mx-auto max-w-3xl">
      <MastersHeading title="マスタ管理" />
      {isSqliteBackend() ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {sections.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="rounded-lg border border-paper-line bg-white/70 p-5 transition hover:border-kent-blue-400 dark:border-slate-800 dark:bg-slate-900/40"
            >
              <p className="font-display text-lg font-bold text-stone-800 dark:text-slate-100">
                {s.label}
              </p>
              <p className="mt-1 text-sm text-stone-500 dark:text-slate-400">{s.desc}</p>
            </Link>
          ))}
        </div>
      ) : (
        <MastersNotice />
      )}
    </div>
  );
}

export const getConfig = async () => ({ render: "dynamic" as const });
