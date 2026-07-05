"use client";

import { Link } from "waku";
import { authClient } from "@/lib/auth-client";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const { data: session, isPending } = authClient.useSession();

  const signOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  return (
    <header className="border-b border-stone-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {!isPending && session ? (
            <>
              <Link
                to="/invoice/list/1"
                className="rounded px-3 py-2 hover:bg-stone-100 dark:hover:bg-slate-800"
              >
                請求書
              </Link>
              <Link
                to="/user"
                className="rounded px-3 py-2 hover:bg-stone-100 dark:hover:bg-slate-800"
              >
                設定
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="rounded px-3 py-2 text-stone-500 hover:bg-stone-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                ログアウト
              </button>
            </>
          ) : (
            !isPending && (
              <Link
                to="/login"
                className="rounded px-3 py-2 hover:bg-stone-100 dark:hover:bg-slate-800"
              >
                ログイン
              </Link>
            )
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
