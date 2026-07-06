import { Link } from "waku";
import { Card } from "@/components/card";
import { ErrorState } from "@/components/data-states";
import { AccountForm } from "@/components/masters/account-form";
import { MastersHeading } from "@/components/masters/masters-heading";
import { MastersNotice } from "@/components/masters/masters-notice";
import { isSqliteBackend } from "@/lib/data/backend";
import { db } from "@/lib/db";
import { getAccountRecord } from "@/lib/repository";
import { requireSession } from "@/lib/session";

const breadcrumb = <Link to="/masters/accounts">← 自社マスタ</Link>;

export default async function MastersAccountEditPage({ id }: { id: string }) {
  const session = await requireSession();
  return (
    <div className="mx-auto max-w-3xl">
      <MastersHeading title="自社の編集" breadcrumb={breadcrumb} />
      {!isSqliteBackend() ? <MastersNotice /> : <EditBody userId={session.user.id} id={id} />}
    </div>
  );
}

function EditBody({ userId, id }: { userId: string; id: string }) {
  const record = getAccountRecord(db, userId, id);
  if (record === null) {
    return <ErrorState message="自社情報が見つかりませんでした。" />;
  }
  return (
    <Card>
      <AccountForm record={record} />
    </Card>
  );
}

export const getConfig = async () => ({ render: "dynamic" as const });
