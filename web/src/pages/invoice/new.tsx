import { InvoiceEditor } from "@/components/invoice-editor";
import { SqliteOnlyNotice } from "@/components/sqlite-only-notice";
import { isSqliteBackend } from "@/lib/data/backend";
import { db } from "@/lib/db";
import { listAccountRecords, listCustomerRecords, listItems } from "@/lib/repository";
import { requireSession } from "@/lib/session";

export default async function InvoiceNewPage() {
  const session = await requireSession();
  const userId = session.user.id;
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 font-display text-2xl font-bold text-kent-blue-500 dark:text-kent-blue-200">
        請求書の新規作成
      </h1>
      {isSqliteBackend() ? (
        <InvoiceEditor
          initial={null}
          customers={listCustomerRecords(db, userId).map((c) => ({
            id: c.id,
            label: c.companyName || c.name,
          }))}
          accounts={listAccountRecords(db, userId).map((a) => ({ id: a.id, label: a.companyName }))}
          items={listItems(db, userId).map((it) => ({
            id: it.id,
            name: it.name,
            unitPrice: it.unitPrice,
          }))}
        />
      ) : (
        <SqliteOnlyNotice>
          請求書の作成は DATA_BACKEND=sqlite のときに利用できます（現在は Notion 読み取りモード）。
        </SqliteOnlyNotice>
      )}
    </div>
  );
}

export const getConfig = async () => ({ render: "dynamic" as const });
