"use client";

import { useState } from "react";
import { Link } from "waku";
import { authClient } from "@/lib/auth-client";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const navLink =
  "rounded-none border-b-2 border-transparent px-3 py-2 font-medium text-stone-600 transition hover:border-kent-blue-400 hover:text-kent-blue-600 dark:text-slate-300 dark:hover:border-kent-blue-300 dark:hover:text-kent-blue-200";

// モバイルメニューの項目（44px タップ領域）。
const mobileLink =
  "flex min-h-11 items-center px-4 font-medium text-stone-600 transition hover:bg-kent-blue-500/5 dark:text-slate-300 dark:hover:bg-kent-blue-400/5";

export function Header() {
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  const close = () => setOpen(false);

  return (
    <header className="border-b border-paper-line bg-paper/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="leading-none" onClick={close}>
          <Logo />
        </Link>
        {/* デスクトップ: 横並びナビ */}
        <nav className="hidden items-center gap-1 text-sm sm:flex">
          {!isPending && session ? (
            <>
              <Link to="/invoice/list/1" className={navLink}>
                請求書
              </Link>
              <Link to="/masters" className={navLink}>
                マスタ
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
        {/* モバイル: テーマ切替 + ハンバーガー */}
        <div className="flex items-center gap-1 sm:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="メニュー"
            className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-[5px] rounded p-2 text-stone-600 transition hover:bg-stone-900/5 dark:text-slate-300 dark:hover:bg-white/5"
          >
            <span
              className={`block h-0.5 w-5 bg-current transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 bg-current transition-opacity ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 bg-current transition-transform ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>
      {/* モバイルメニュー（開いたときだけ・縦並び） */}
      {open && (
        <nav className="border-t border-paper-line text-sm sm:hidden dark:border-slate-800">
          {!isPending && session ? (
            <>
              <Link to="/invoice/list/1" className={mobileLink} onClick={close}>
                請求書
              </Link>
              <Link to="/masters" className={mobileLink} onClick={close}>
                マスタ
              </Link>
              <Link to="/user" className={mobileLink} onClick={close}>
                設定
              </Link>
              <button
                type="button"
                onClick={signOut}
                className={`${mobileLink} w-full text-left text-stone-400 dark:text-slate-500`}
              >
                ログアウト
              </button>
            </>
          ) : (
            !isPending && (
              <Link to="/login" className={mobileLink} onClick={close}>
                ログイン
              </Link>
            )
          )}
        </nav>
      )}
    </header>
  );
}
