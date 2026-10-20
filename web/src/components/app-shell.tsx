"use client";

import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  LuBuilding2,
  LuFilePlus,
  LuFileText,
  LuLayers,
  LuLogOut,
  LuPackage,
  LuSettings,
  LuUsers,
} from "react-icons/lu";
import { Link } from "waku";
import type { Unstable_RouteHref as RouteHref } from "waku/router/client-core";
import { useRouter } from "waku/router/client";
import { Footer } from "@/components/footer";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { authClient } from "@/lib/auth-client";

// ログイン前でも開くページ。ここではナビを出さず、ロゴとログイン導線だけにする。
const PUBLIC_PATHS = new Set(["/", "/login", "/oauth/consent"]);

type NavItem = { to: RouteHref; label: string; icon: IconType; active: (path: string) => boolean };

const isInvoicePath = (path: string) =>
  path.startsWith("/invoice/list") || path.startsWith("/invoice/item");

const INVOICE_NAV: NavItem[] = [
  { to: "/invoice/list/1", label: "請求書一覧", icon: LuFileText, active: isInvoicePath },
];

const MASTER_NAV: NavItem[] = [
  {
    to: "/masters/customers",
    label: "顧客",
    icon: LuUsers,
    active: (p) => p.startsWith("/masters/customers"),
  },
  {
    to: "/masters/accounts",
    label: "自社",
    icon: LuBuilding2,
    active: (p) => p.startsWith("/masters/accounts"),
  },
  {
    to: "/masters/items",
    label: "項目",
    icon: LuPackage,
    active: (p) => p.startsWith("/masters/items"),
  },
];

// スマホの下部タブ。マスタは 1 つにまとめ、マスタ一覧から各マスタへ進む。
const TAB_NAV: NavItem[] = [
  { to: "/invoice/list/1", label: "請求書", icon: LuFileText, active: isInvoicePath },
  { to: "/invoice/new", label: "新規作成", icon: LuFilePlus, active: (p) => p === "/invoice/new" },
  { to: "/masters", label: "マスタ", icon: LuLayers, active: (p) => p.startsWith("/masters") },
  { to: "/user", label: "設定", icon: LuSettings, active: (p) => p === "/user" },
];

/** 編集画面は独自の固定バー（御請求額 + 保存）を下に出すので、下部タブを隠す。 */
const isEditorPath = (path: string) => path === "/invoice/new" || path.endsWith("/edit");

export async function signOutAndLeave() {
  await authClient.signOut();
  window.location.href = "/";
}

export function AppShell({ children }: { children: ReactNode }) {
  const { path } = useRouter();
  if (PUBLIC_PATHS.has(path)) {
    return <PublicShell>{children}</PublicShell>;
  }
  const editor = isEditorPath(path);
  return (
    <div className="min-h-svh md:grid md:grid-cols-[13.5rem_minmax(0,1fr)]">
      <Sidebar path={path} />
      <div className="flex min-h-svh min-w-0 flex-col">
        {/* スマホ: 上部はロゴとテーマ切替だけ（ナビは下部タブ） */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-paper-line bg-paper/90 px-4 py-2 backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-950/90">
          <Link to="/invoice/list/1" className="leading-none">
            <Logo />
          </Link>
          <ThemeToggle />
        </header>
        <main
          className={`mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-8 ${editor ? "" : "pb-24 md:pb-8"}`}
        >
          {children}
        </main>
      </div>
      {!editor && <BottomTabs path={path} />}
    </div>
  );
}

function PublicShell({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b border-paper-line bg-paper/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="leading-none">
            <Logo />
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {!isPending && (
              <Link
                to={session ? "/invoice/list/1" : "/login"}
                className="px-3 py-2 font-medium text-stone-600 transition hover:text-kent-blue-600 dark:text-slate-300 dark:hover:text-kent-blue-200"
              >
                {session ? "請求書一覧へ" : "ログイン"}
              </Link>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}

const sideLink = "flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition";
const sideIdle =
  "text-stone-600 hover:bg-stone-900/5 hover:text-stone-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-slate-100";
const sideActive =
  "bg-kent-blue-500/10 text-kent-blue-600 dark:bg-kent-blue-400/15 dark:text-kent-blue-100";

function SideLinks({ items, path }: { items: NavItem[]; path: string }) {
  return (
    <ul className="flex flex-col gap-0.5">
      {items.map(({ to, label, icon: Icon, active }) => {
        const on = active(path);
        return (
          <li key={to}>
            <Link
              to={to}
              aria-current={on ? "page" : undefined}
              className={`${sideLink} ${on ? sideActive : sideIdle}`}
            >
              <Icon aria-hidden className="shrink-0 text-base" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Sidebar({ path }: { path: string }) {
  return (
    // 背景と罫線は列いっぱいに、中身は画面に固定する（長いページでも途切れないように）。
    <div className="hidden border-r border-paper-line bg-white/50 md:block dark:border-slate-800 dark:bg-slate-900/30">
      <aside className="sticky top-0 flex h-svh flex-col px-3 py-5">
        <Link to="/invoice/list/1" className="mb-6 px-3 leading-none">
          <Logo />
        </Link>
        <Link
          to="/invoice/new"
          className="mb-5 flex min-h-10 items-center justify-center gap-2 rounded-md bg-kent-blue-500 px-3 text-sm font-bold text-white transition hover:bg-kent-blue-600"
        >
          <LuFilePlus aria-hidden />
          請求書を作成
        </Link>
        <nav className="flex flex-1 flex-col gap-5 overflow-y-auto">
          <SideLinks items={INVOICE_NAV} path={path} />
          <div>
            <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 dark:text-slate-500">
              マスタ
            </p>
            <SideLinks items={MASTER_NAV} path={path} />
          </div>
        </nav>
        <div className="flex flex-col gap-0.5 border-t border-paper-line pt-3 dark:border-slate-800">
          <SideLinks
            items={[{ to: "/user", label: "設定", icon: LuSettings, active: (p) => p === "/user" }]}
            path={path}
          />
          <ThemeToggle withLabel />
          <button type="button" onClick={signOutAndLeave} className={`${sideLink} ${sideIdle}`}>
            <LuLogOut aria-hidden className="shrink-0 text-base" />
            ログアウト
          </button>
        </div>
      </aside>
    </div>
  );
}

function BottomTabs({ path }: { path: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-paper-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-950/95">
      <ul className="grid grid-cols-4">
        {TAB_NAV.map(({ to, label, icon: Icon, active }) => {
          const on = active(path);
          return (
            <li key={to}>
              <Link
                to={to}
                aria-current={on ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium transition ${
                  on
                    ? "text-kent-blue-600 dark:text-kent-blue-200"
                    : "text-stone-500 dark:text-slate-400"
                }`}
              >
                <Icon aria-hidden className="text-xl" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
