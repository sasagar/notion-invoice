"use client";

import { LuLogOut } from "react-icons/lu";
import { signOutAndLeave } from "@/components/app-shell";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={signOutAndLeave}
      className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-paper-line px-4 text-sm text-stone-600 transition hover:border-shuiro-400 hover:text-shuiro-600 dark:border-slate-700 dark:text-slate-300"
    >
      <LuLogOut aria-hidden />
      ログアウト
    </button>
  );
}
