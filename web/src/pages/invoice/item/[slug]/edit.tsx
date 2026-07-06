import { ErrorState } from "@/components/data-states";
import { InvoiceEditor } from "@/components/invoice-editor";
import { SqliteOnlyNotice } from "@/components/sqlite-only-notice";
import { isSqliteBackend } from "@/lib/data/backend";
import { db } from "@/lib/db";
import {
  getInvoiceEditorByNumber,
  listAccountRecords,
  listCustomerRecords,
  listItems,
} from "@/lib/repository";
import { requireSession } from "@/lib/session";

export default async function InvoiceEditPage({ slug }: { slug: string }) {
  const session = await requireSession();
  return (
    <div className="mx-auto w-full max-w-5xl xl:-mx-16 xl:w-auto xl:max-w-none">
      <h1 className="mb-6 font-display text-2xl font-bold text-kent-blue-500 dark:text-kent-blue-200">
        請求書の編集
      </h1>
      {isSqliteBackend() ? (
        <EditBody userId={session.user.id} slug={slug} />
      ) : (
        <SqliteOnlyNotice>
          請求書の編集は DATA_BACKEND=sqlite のときに利用できます（現在は Notion 読み取りモード）。
        </SqliteOnlyNotice>
      )}
    </div>
  );
}

function EditBody({ userId, slug }: { userId: string; slug: string }) {
  const initial = getInvoiceEditorByNumber(db, userId, slug);
  if (initial === null) {
    return <ErrorState message={`請求書 #${slug} が見つかりませんでした。`} />;
  }
  return (
    <InvoiceEditor
      initial={initial}
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
  );
}

export const getConfig = async () => ({ render: "dynamic" as const });
