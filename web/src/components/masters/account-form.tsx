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
  uploadSeal,
} from "@/components/masters/shared";
import type { AccountRecord } from "@/lib/repository";

const LIST = "/masters/accounts";

/** フォームの seal 入力から、送信する sealFileId を決める（新規UP/削除/据え置き）。 */
async function resolveSealFileId(
  form: FormData,
  record?: AccountRecord,
): Promise<{ ok: true; sealFileId: string | null } | { ok: false; error: string }> {
  const seal = form.get("seal");
  if (seal instanceof File && seal.size > 0) {
    const up = await uploadSeal(seal);
    return up.ok ? { ok: true, sealFileId: up.id } : { ok: false, error: up.error };
  }
  if (form.get("removeSeal") === "on") {
    return { ok: true, sealFileId: null };
  }
  return { ok: true, sealFileId: record?.sealFileId ?? null };
}

/** 自社の作成/編集フォーム。印影は差し替え/削除に対応。 */
export function AccountForm({ record }: { record?: AccountRecord }) {
  const router = useRouter();
  const editing = record !== undefined;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const el = e.currentTarget;
    const f = new FormData(el);
    setBusy(true);
    setError("");
    const seal = await resolveSealFileId(f, record);
    if (!seal.ok) {
      setBusy(false);
      setError(seal.error);
      return;
    }
    const body = {
      slug: String(f.get("slug") ?? ""),
      companyName: String(f.get("companyName") ?? ""),
      contactName: String(f.get("contactName") ?? ""),
      companyInfo: String(f.get("companyInfo") ?? ""),
      bankInfo: String(f.get("bankInfo") ?? ""),
      registrationNumber: String(f.get("registrationNumber") ?? ""),
      sealFileId: seal.sealFileId,
    };
    const res = editing
      ? await jsonMutate(`/api/accounts/${record.id}`, "PUT", body)
      : await jsonMutate("/api/accounts", "POST", body);
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
        `自社「${record.companyName}」を削除しますか？（この自社を参照する請求書は自社未設定になります）`,
      )
    ) {
      return;
    }
    setBusy(true);
    setError("");
    const res = await jsonDelete(`/api/accounts/${record.id}`);
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
          会社名
          <input
            name="companyName"
            defaultValue={record?.companyName ?? ""}
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
        <label className={labelClass}>
          スラッグ
          <input name="slug" defaultValue={record?.slug ?? ""} className={inputClass} />
        </label>
        <label className={labelClass}>
          登録番号
          <input
            name="registrationNumber"
            defaultValue={record?.registrationNumber ?? ""}
            placeholder="T1234567890123"
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
        <label className={`${labelClass} sm:col-span-2`}>
          銀行情報
          <textarea
            name="bankInfo"
            defaultValue={record?.bankInfo ?? ""}
            rows={2}
            className={`${inputClass} resize-y`}
          />
        </label>
        <div className={`${labelClass} sm:col-span-2`}>
          印影
          <div className="flex items-center gap-4">
            {record?.sealImageUrl && (
              <img
                src={record.sealImageUrl}
                alt="現在の印影"
                className="h-14 w-14 shrink-0 object-contain"
              />
            )}
            <input
              name="seal"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="text-xs font-normal normal-case text-stone-500 dark:text-slate-400"
            />
          </div>
          {record?.sealImageUrl && (
            <label className="mt-1 flex items-center gap-2 text-xs font-normal normal-case text-stone-500 dark:text-slate-400">
              <input name="removeSeal" type="checkbox" />
              印影を削除する
            </label>
          )}
        </div>
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
