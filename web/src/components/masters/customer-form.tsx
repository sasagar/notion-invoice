"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "waku/router/client";
import { CustomerArchiveButton } from "@/components/masters/customer-archive-button";
import {
  dangerBtn,
  inputClass,
  jsonDelete,
  jsonMutate,
  labelClass,
  primaryBtn,
  subtleBtn,
} from "@/components/masters/shared";
import type { CustomerRecord } from "@/lib/repository";

const LIST = "/masters/customers";

/** 顧客の作成/編集フォーム。record ありで編集（削除ボタン付き）、なしで新規作成。 */
export function CustomerForm({ record }: { record?: CustomerRecord }) {
  const router = useRouter();
  const editing = record !== undefined;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const el = e.currentTarget;
    const f = new FormData(el);
    const body = {
      name: String(f.get("name") ?? ""),
      companyName: String(f.get("companyName") ?? ""),
      honorific: String(f.get("honorific") ?? ""),
      companyInfo: String(f.get("companyInfo") ?? ""),
      contactName: String(f.get("contactName") ?? ""),
    };
    setBusy(true);
    setError("");
    const res = editing
      ? await jsonMutate(`/api/customers/${record.id}`, "PUT", body)
      : await jsonMutate("/api/customers", "POST", body);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    if (editing) {
      router.push(LIST);
    } else {
      el.reset();
      await router.reload();
    }
  };

  const onDelete = async () => {
    if (!record) {
      return;
    }
    if (
      !window.confirm(
        `顧客「${record.companyName || record.name}」を削除しますか？（この顧客を参照する請求書は顧客未設定になります）`,
      )
    ) {
      return;
    }
    setBusy(true);
    setError("");
    const res = await jsonDelete(`/api/customers/${record.id}`);
    setBusy(false);
    if (res.ok) {
      router.push(LIST);
    } else {
      setError(res.error);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {error && <p className="text-sm text-shuiro-600 dark:text-shuiro-400">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          顧客名
          <input name="name" defaultValue={record?.name ?? ""} className={inputClass} />
        </label>
        <label className={labelClass}>
          社名/個人名
          <input
            name="companyName"
            defaultValue={record?.companyName ?? ""}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          敬称
          <input
            name="honorific"
            defaultValue={record?.honorific ?? ""}
            placeholder="御中 / 様"
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          担当者名
          <input
            name="contactName"
            defaultValue={record?.contactName ?? ""}
            className={inputClass}
          />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          会社情報
          <textarea
            name="companyInfo"
            defaultValue={record?.companyInfo ?? ""}
            rows={2}
            className={`${inputClass} resize-y`}
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={busy} className={primaryBtn}>
          {editing ? "保存" : "追加"}
        </button>
        {record && <CustomerArchiveButton id={record.id} archived={record.archivedAt !== null} />}
        {editing && record && (
          <button type="button" onClick={onDelete} disabled={busy} className={dangerBtn}>
            削除
          </button>
        )}
        {editing && (
          <button type="button" onClick={() => router.push(LIST)} className={subtleBtn}>
            一覧へ戻る
          </button>
        )}
      </div>
    </form>
  );
}
