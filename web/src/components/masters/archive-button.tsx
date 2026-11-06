"use client";

import { useState } from "react";
import { useRouter } from "waku/router/client";
import { jsonMutate } from "@/components/masters/shared";

/**
 * 顧客のアーカイブ/復元ボタン。削除と違い過去の請求書との紐付けは保たれる。
 * アーカイブ済み顧客はエディタの選択肢と通常一覧から外れる。
 */
export function CustomerArchiveButton({
  id,
  archived,
  className = "",
}: {
  id: string;
  archived: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const toggle = async () => {
    setBusy(true);
    setError("");
    const res = await jsonMutate(`/api/customers/${id}/archive`, "POST", { archived: !archived });
    setBusy(false);
    if (res.ok) {
      router.reload();
    } else {
      setError(res.error);
    }
  };

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={`rounded-sm border border-paper-line px-3 py-2 text-sm text-stone-600 transition hover:border-kent-blue-400 hover:text-kent-blue-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-kent-blue-700 dark:hover:text-kent-blue-200 ${className}`}
      >
        {busy ? "処理中…" : archived ? "復元する" : "アーカイブ"}
      </button>
      {error && <span className="text-xs text-shuiro-600 dark:text-shuiro-400">{error}</span>}
    </span>
  );
}
