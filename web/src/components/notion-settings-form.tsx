"use client";

import { type FormEvent, useState } from "react";

type Status = "idle" | "saving" | "saved" | "error";

const inputClass =
  "w-full border-b-2 border-paper-line bg-transparent px-0.5 py-2 outline-none transition focus:border-kent-blue-500 dark:border-slate-700 dark:focus:border-kent-blue-300";

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
    <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-5">
      <p className="text-sm text-stone-500 dark:text-slate-400">
        現在の状態:{" "}
        <span className="font-medium text-stone-700 dark:text-slate-200">
          {hasCreds ? "設定済み" : "未設定"}
        </span>
      </p>
      <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400">
        Notion データベースID
        <input name="dbId" required placeholder="データベースID" className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400">
        Notion APIキー
        <input
          name="apiKey"
          type="password"
          required
          placeholder="ntn_..."
          className={inputClass}
        />
      </label>
      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded-sm bg-kent-blue-500 py-2 text-white transition hover:bg-kent-blue-600 disabled:opacity-50"
      >
        {status === "saving" ? "保存中…" : "保存"}
      </button>
      {message && (
        <p
          className={
            status === "error"
              ? "text-sm text-shuiro-600 dark:text-shuiro-400"
              : "text-sm text-kent-blue-600 dark:text-kent-blue-200"
          }
        >
          {message}
        </p>
      )}
    </form>
  );
}
