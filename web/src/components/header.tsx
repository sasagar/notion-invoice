"use client";

import { Link } from "waku";
import { authClient } from "@/lib/auth-client";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const navLink =
  "rounded-none border-b-2 border-transparent px-3 py-2 font-medium text-stone-600 transition hover:border-kent-blue-400 hover:text-kent-blue-600 dark:text-slate-300 dark:hover:border-kent-blue-300 dark:hover:text-kent-blue-200";

export function Header() {
  const { data: session, isPending } = authClient.useSession();

  const signOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  return (
    <header className="border-b border-paper-line bg-paper/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="leading-none">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {!isPending && session ? (
            <>
              <Link to="/invoice/list/1" className={navLink}>
                請求書
              </Link>
              <Link to="/user" className={navLink}>
                設定
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="rounded-none border-b-2 border-transparent px-3 py-2 text-stone-400 transition hover:border-stone-400 hover:text-stone-600 dark:text-slate-500 dark:hover:border-slate-500 dark:hover:text-slate-300"
              >
                ログアウト
              </button>
            </>
          ) : (
            !isPending && (
              <Link to="/login" className={navLink}>
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
