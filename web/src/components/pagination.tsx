import { Link } from "waku";

export function Pagination({ current, totalPages }: { current: number; totalPages: number }) {
  if (totalPages <= 1) {
    return null;
  }
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const linkBase = "rounded px-3 py-1.5 text-sm border border-stone-200 dark:border-slate-700";
  return (
    <nav className="mt-6 flex flex-wrap items-center justify-center gap-1">
      {pages.map((n) => (
        <Link
          key={n}
          to={`/invoice/list/${n}`}
          className={
            n === current
              ? `${linkBase} bg-kent-blue-500 text-white border-kent-blue-500`
              : `${linkBase} hover:bg-stone-100 dark:hover:bg-slate-800`
          }
        >
          {n}
        </Link>
      ))}
    </nav>
  );
}
