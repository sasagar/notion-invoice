"use client";

import { type FormEvent, useState } from "react";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { useRouter } from "waku/router/client";
import { authClient } from "@/lib/auth-client";

const inputClass =
  "w-full border-b-2 border-paper-line bg-transparent px-0.5 py-2 outline-none transition focus:border-kent-blue-500 dark:border-slate-700 dark:focus:border-kent-blue-300";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const router = useRouter();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    // MCP の OAuth 認可中（URL に署名付きクエリ sig がある）は、oauthProviderClient が
    // oauth_query を自動添付し、応答 {redirect, url}（同意画面かクライアントの戻り先）へ
    // better-auth クライアントが遷移する。その場合は一覧へ移動しない。
    const res = await authClient.signIn.email(
      {
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      },
      captchaToken ? { headers: { "x-captcha-response": captchaToken } } : undefined,
    );
    if (!res.error && new URLSearchParams(window.location.search).has("sig")) {
      return;
    }
    setPending(false);
    if (res.error) {
      setError("メールアドレスまたはパスワードが正しくありません");
      return;
    }
    router.push("/invoice/list/1");
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400">
        メールアドレス
        <input name="email" type="email" required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400">
        パスワード
        <input name="password" type="password" required className={inputClass} />
      </label>
      <TurnstileWidget onToken={setCaptchaToken} />
      {error && <p className="text-sm text-shuiro-600 dark:text-shuiro-400">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-sm bg-kent-blue-500 py-2.5 font-medium text-white transition hover:bg-kent-blue-600 disabled:opacity-50"
      >
        {pending ? "ログイン中…" : "ログイン"}
      </button>
    </form>
  );
}
