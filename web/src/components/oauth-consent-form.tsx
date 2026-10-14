"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

/**
 * 同意画面の許可/拒否ボタン。oauthProviderClient が URL の署名付きクエリを
 * oauth_query として添付して /oauth2/consent に送り、返ってきた {redirect, url}
 * （MCP クライアントのコールバック）へ better-auth クライアントが遷移する。
 */
export function ConsentForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const decide = async (accept: boolean) => {
    setPending(true);
    setError(null);
    const res = await authClient.oauth2.consent({ accept });
    if (res.error) {
      setPending(false);
      setError("処理に失敗しました。接続元のアプリからやり直してください。");
    }
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
