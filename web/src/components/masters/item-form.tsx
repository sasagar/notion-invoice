"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "waku/router/client";
import {
  dangerBtn,
  inputClass,
  jsonDelete,
  jsonMutate,
  labelClass,
  primaryBtn,
  subtleBtn,
} from "@/components/masters/shared";
import type { ItemMaster } from "@/lib/repository";

const LIST = "/masters/items";

/** 項目の作成/編集フォーム。record ありで編集（削除ボタン付き）、なしで新規作成。 */
export function ItemForm({ record }: { record?: ItemMaster }) {
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
      unitPrice: String(f.get("unitPrice") ?? ""),
    };
    setBusy(true);
    setError("");
    const res = editing
      ? await jsonMutate(`/api/items/${record.id}`, "PUT", body)
      : await jsonMutate("/api/items", "POST", body);
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
        `項目「${record.name}」を削除しますか？（請求書の明細スナップショットには影響しません）`,
      )
    ) {
      return;
    }
    setBusy(true);
    setError("");
    const res = await jsonDelete(`/api/items/${record.id}`);
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
      <div className="flex flex-wrap items-end gap-4">
        <label className={`${labelClass} flex-1`}>
          項目名
          <input name="name" defaultValue={record?.name ?? ""} className={inputClass} />
        </label>
        <label className={labelClass}>
          単価(税抜)
          <input
            name="unitPrice"
            type="number"
            step="any"
            defaultValue={record?.unitPrice ?? ""}
            placeholder="8000"
            className={`${inputClass} w-36 text-right`}
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={busy} className={primaryBtn}>
          {editing ? "保存" : "追加"}
        </button>
        {editing && (
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
