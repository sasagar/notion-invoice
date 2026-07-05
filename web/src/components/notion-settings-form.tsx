"use client";

import { type FormEvent, useState } from "react";

type Status = "idle" | "saving" | "saved" | "error";

export function NotionSettingsForm({ hasCreds }: { hasCreds: boolean }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    setStatus("saving");
    setMessage("");
    const form = new FormData(formEl);
    const res = await fetch("/api/notion-credentials", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        dbId: String(form.get("dbId") ?? ""),
        apiKey: String(form.get("apiKey") ?? ""),
      }),
    });
    if (res.ok) {
      setStatus("saved");
      setMessage("保存しました");
      formEl.reset();
    } else {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setStatus("error");
      setMessage(j.error ?? "保存に失敗しました");
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 max-w-md">
      <p className="text-sm">現在の状態: {hasCreds ? "設定済み" : "未設定"}</p>
      <label className="flex flex-col gap-1 text-sm">
        Notion データベースID
        <input
          name="dbId"
          required
          placeholder="データベースID"
          className="border rounded px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Notion APIキー
        <input
          name="apiKey"
          type="password"
          required
          placeholder="ntn_..."
          className="border rounded px-3 py-2"
        />
      </label>
      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded bg-kent-blue-500 text-white py-2 disabled:opacity-50"
      >
        {status === "saving" ? "保存中…" : "保存"}
      </button>
      {message && (
        <p className={status === "error" ? "text-red-600 text-sm" : "text-green-700 text-sm"}>
          {message}
        </p>
      )}
    </form>
  );
}
