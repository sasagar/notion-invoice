"use client";

import { useId, useState } from "react";
import { useRouter } from "waku/router/client";
import { StatusStamp } from "@/components/status-stamp";
import { INVOICE_STATUSES } from "@/lib/invoice-schema";

/**
 * 一覧用: 検収印スタンプをそのままトリガーにしたステータス変更。
 * スタンプの上に透明な select を重ね、タップ/クリックで native の選択肢が開く
 * （モバイルでも自然に操作できる）。SQLite モードのときのみ使われる。
 */
export function StatusStampSelect({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const selectId = useId();
  const [busy, setBusy] = useState(false);

  const onChange = async (next: string) => {
    if (next === status || busy) {
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/invoices/${id}/status`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    if (res.ok) {
      router.reload();
    }
  };

  return (
    <span className={`relative inline-flex ${busy ? "opacity-50" : ""}`} title="ステータスを変更">
      <StatusStamp status={status} />
      <label className="sr-only" htmlFor={selectId}>
        ステータスを変更
      </label>
      <select
        id={selectId}
        value={status}
        disabled={busy}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      >
        {INVOICE_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </span>
  );
}
