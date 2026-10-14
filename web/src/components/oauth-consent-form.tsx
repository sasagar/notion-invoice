"use client";

import { useState } from "react";

/**
 * 同意画面の許可/拒否ボタン。better-auth の /oauth2/consent に結果を送り、
 * 返ってきた redirectURI（MCP クライアントのコールバック）へ遷移する。
 */
export function ConsentForm({ consentCode }: { consentCode: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const decide = async (accept: boolean) => {
    setPending(true);
    setError(null);
    const res = await fetch("/api/auth/oauth2/consent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ accept, consent_code: consentCode }),
    }).catch(() => null);
    const body = (await res?.json().catch(() => null)) as { redirectURI?: string } | null;
    if (!res?.ok || !body?.redirectURI) {
      setPending(false);
      setError("処理に失敗しました。接続元のアプリからやり直してください。");
      return;
    }
    window.location.href = body.redirectURI;
  };

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-shuiro-600 dark:text-shuiro-400">{error}</p>}
      <div className="flex gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => decide(false)}
          className="flex-1 rounded-sm border border-paper-line py-2.5 font-medium transition hover:bg-stone-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          拒否
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => decide(true)}
          className="flex-1 rounded-sm bg-kent-blue-500 py-2.5 font-medium text-white transition hover:bg-kent-blue-600 disabled:opacity-50"
        >
          許可
        </button>
      </div>
    </div>
  );
}
