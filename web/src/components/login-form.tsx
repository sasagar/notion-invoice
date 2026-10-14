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
    const credentials = {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };
    const captchaHeaders: Record<string, string> = captchaToken
      ? { "x-captcha-response": captchaToken }
      : {};

    // MCP クライアントの OAuth 認可から来た場合（/login?client_id=...）。
    // サインイン応答はクライアントの redirect_uri への 302 になり、fetch が追うと
    // クロスオリジンで失敗するため manual で止め、Cookie 確立後に認可を再開させる。
    const search = window.location.search;
    if (new URLSearchParams(search).has("client_id")) {
      const raw = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...captchaHeaders },
        body: JSON.stringify(credentials),
        redirect: "manual",
      }).catch(() => null);
      if (raw && (raw.ok || raw.type === "opaqueredirect")) {
        window.location.href = `/api/auth/mcp/authorize${search}`;
        return;
      }
      setPending(false);
      setError("メールアドレスまたはパスワードが正しくありません");
      return;
    }

    const res = await authClient.signIn.email(credentials, { headers: captchaHeaders });
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
