import { Link } from "waku";
import { Card } from "@/components/card";
import { ErrorState } from "@/components/data-states";
import { ItemForm } from "@/components/masters/item-form";
import { MastersHeading } from "@/components/masters/masters-heading";
import { MastersNotice } from "@/components/masters/masters-notice";
import { isSqliteBackend } from "@/lib/data/backend";
import { db } from "@/lib/db";
import { getItem } from "@/lib/repository";
import { requireSession } from "@/lib/session";

const breadcrumb = <Link to="/masters/items">← 項目マスタ</Link>;

export default async function MastersItemEditPage({ id }: { id: string }) {
  const session = await requireSession();
  return (
    <div className="mx-auto max-w-3xl">
      <MastersHeading title="項目の編集" breadcrumb={breadcrumb} />
      {!isSqliteBackend() ? <MastersNotice /> : <EditBody userId={session.user.id} id={id} />}
    </div>
  );
}

function EditBody({ userId, id }: { userId: string; id: string }) {
  const record = getItem(db, userId, id);
  if (record === null) {
    return <ErrorState message="項目が見つかりませんでした。" />;
  }
  return (
    <Card>
      <ItemForm record={record} />
    </Card>
  );
}

export const getConfig = async () => ({ render: "dynamic" as const });
