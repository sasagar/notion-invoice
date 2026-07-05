"use client";

import { type FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const res = await authClient.signIn.email({ email, password });
    setPending(false);
    if (res.error) {
      setError("メールアドレスまたはパスワードが正しくありません");
      return;
    }
    window.location.href = "/";
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 max-w-sm">
      <input
        name="email"
        type="email"
        required
        placeholder="メールアドレス"
        className="border rounded px-3 py-2"
      />
      <input
        name="password"
        type="password"
        required
        placeholder="パスワード"
        className="border rounded px-3 py-2"
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-kent-blue-500 text-white py-2 disabled:opacity-50"
      >
        {pending ? "ログイン中…" : "ログイン"}
      </button>
    </form>
  );
}
