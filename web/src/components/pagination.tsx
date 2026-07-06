import { Link } from "waku";

export function Pagination({ current, totalPages }: { current: number; totalPages: number }) {
  if (totalPages <= 1) {
    return null;
  }
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const linkBase =
    "rounded-sm border border-paper-line px-3 py-1.5 font-mono text-sm dark:border-slate-700";
  return (
    <nav className="mt-6 flex flex-wrap items-center justify-center gap-1">
      {pages.map((n) => (
        <Link
          key={n}
          to={`/invoice/list/${n}`}
          className={
            n === current
              ? `${linkBase} border-kent-blue-500 bg-kent-blue-500 text-white`
              : `${linkBase} hover:border-kent-blue-300 hover:text-kent-blue-600 dark:hover:border-kent-blue-700 dark:hover:text-kent-blue-200`
          }
        >
          {n}
        </Link>
      ))}
    </nav>
  );
}
