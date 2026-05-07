import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Semua search param saat ini (selain page) untuk dipreserve di URL */
  params?: Record<string, string>;
}

function buildHref(page: number, params: Record<string, string>) {
  const p = new URLSearchParams({ ...params, page: String(page) });
  return `?${p.toString()}`;
}

function getPageNumbers(page: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (page > 3) pages.push("...");
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
    pages.push(i);
  }
  if (page < totalPages - 2) pages.push("...");
  pages.push(totalPages);
  return pages;
}

export function Pagination({ page, totalPages, params = {} }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-1"
      aria-label="Navigasi halaman"
    >
      {/* Prev */}
      {page > 1 ? (
        <Link
          href={buildHref(page - 1, params)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-on-surface-variant shadow-sm transition hover:bg-primary hover:text-white"
          aria-label="Halaman sebelumnya"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </Link>
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-full opacity-30">
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </span>
      )}

      {/* Page numbers */}
      {pageNumbers.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="flex h-10 w-10 items-center justify-center text-sm text-on-surface-variant">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p, params)}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition ${
              p === page
                ? "bg-primary text-white shadow-md"
                : "bg-white text-on-surface-variant shadow-sm hover:bg-primary hover:text-white"
            }`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </Link>
        )
      )}

      {/* Next */}
      {page < totalPages ? (
        <Link
          href={buildHref(page + 1, params)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-on-surface-variant shadow-sm transition hover:bg-primary hover:text-white"
          aria-label="Halaman berikutnya"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </Link>
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-full opacity-30">
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </span>
      )}
    </nav>
  );
}
