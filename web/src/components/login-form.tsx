"use client";

import { type FormEvent, useState } from "react";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { authClient } from "@/lib/auth-client";

const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:border-kent-blue-400 focus:ring-2 focus:ring-kent-blue-200 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-kent-blue-900";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await authClient.signIn.email(
      {
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      },
      captchaToken ? { headers: { "x-captcha-response": captchaToken } } : undefined,
    );
    setPending(false);
    if (res.error) {
      setError("メールアドレスまたはパスワードが正しくありません");
      return;
    }
    window.location.href = "/invoice/list/1";
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        メールアドレス
        <input name="email" type="email" required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        パスワード
        <input name="password" type="password" required className={inputClass} />
      </label>
      <TurnstileWidget onToken={setCaptchaToken} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-kent-blue-500 py-2.5 font-medium text-white transition hover:bg-kent-blue-600 disabled:opacity-50"
      >
        {pending ? "ログイン中…" : "ログイン"}
      </button>
    </form>
  );
}
