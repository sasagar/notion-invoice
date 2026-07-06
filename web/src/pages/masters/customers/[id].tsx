import { Link } from "waku";
import { Card } from "@/components/card";
import { ErrorState } from "@/components/data-states";
import { CustomerForm } from "@/components/masters/customer-form";
import { MastersHeading } from "@/components/masters/masters-heading";
import { MastersNotice } from "@/components/masters/masters-notice";
import { isSqliteBackend } from "@/lib/data/backend";
import { db } from "@/lib/db";
import { getCustomerRecord } from "@/lib/repository";
import { requireSession } from "@/lib/session";

const breadcrumb = <Link to="/masters/customers">← 顧客マスタ</Link>;

export default async function MastersCustomerEditPage({ id }: { id: string }) {
  const session = await requireSession();
  return (
    <div className="mx-auto max-w-3xl">
      <MastersHeading title="顧客の編集" breadcrumb={breadcrumb} />
      {!isSqliteBackend() ? <MastersNotice /> : <EditBody userId={session.user.id} id={id} />}
    </div>
  );
}

function EditBody({ userId, id }: { userId: string; id: string }) {
  const record = getCustomerRecord(db, userId, id);
  if (record === null) {
    return <ErrorState message="顧客が見つかりませんでした。" />;
  }
  return (
    <Card>
      <CustomerForm record={record} />
    </Card>
  );
}

export const getConfig = async () => ({ render: "dynamic" as const });
