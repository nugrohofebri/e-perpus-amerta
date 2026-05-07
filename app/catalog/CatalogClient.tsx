"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { BookCard } from "@/components/BookCard";
import { Icon } from "@/components/Icon";
import { Pagination } from "@/components/Pagination";
import type { Book } from "@/lib/types";

const CATEGORIES = [
  { group: "Fiksi", items: ["Novel", "Cerpen", "Puisi"] },
  { group: "Hobi & Hiburan", items: ["Komik", "Musik", "Olahraga", "Kerajinan Tangan"] },
  { group: "Tokoh", items: ["Biografi", "Otobiografi", "Memoar"] },
  { group: "Sosial Politik", items: ["Hukum", "Politik", "Kewarganegaraan", "Ekonomi"] },
  { group: "Sains & Alam", items: ["Lingkungan", "Flora & Fauna", "Antariksa"] },
  { group: "Kesehatan", items: ["Gizi", "Penyakit", "Olahraga Kesehatan"] },
  { group: "Religi", items: ["Kitab Suci", "Sejarah Agama", "Doa-doa"] },
  { group: "Referensi", items: ["Kamus", "Ensiklopedia", "Atlas"] },
  { group: "Lainnya", items: ["Buku Pelajaran", "Umum"] },
];

interface Props {
  books: Book[];
  savedBookIds?: string[];
  isLoggedIn?: boolean;
  page: number;
  totalPages: number;
  total: number;
  search: string;
  category: string;
}

export function CatalogClient({
  books,
  savedBookIds = [],
  isLoggedIn = false,
  page,
  totalPages,
  total,
  search,
  category,
}: Props) {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const s = (data.get("search") as string) ?? "";
    const c = (data.get("category") as string) ?? "";
    const params = new URLSearchParams();
    if (s) params.set("search", s);
    if (c) params.set("category", c);
    params.set("page", "1");
    router.push(`/catalog?${params.toString()}`);
  }

  // Build params for Pagination (exclude page itself)
  const paginationParams: Record<string, string> = {};
  if (search) paginationParams.search = search;
  if (category) paginationParams.category = category;

  return (
    <>
      {/* Hero + Search */}
      <section className="mb-12">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight md:text-6xl">
          Temukan bacaan berikutnya.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-on-surface-variant">
          Katalog buku akademik, literatur klasik, dan bacaan populer yang siap dipinjam.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 flex flex-col gap-3 rounded-[2rem] bg-surface-container-high p-3 md:flex-row md:items-center"
        >
          <div className="relative flex-1">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
            <input
              ref={searchRef}
              className="w-full rounded-2xl border-0 bg-transparent py-4 pl-12 pr-4 font-medium focus:ring-0"
              placeholder="Cari judul, penulis... lalu tekan Enter"
              type="search"
              name="search"
              defaultValue={search}
            />
          </div>
          <div className="flex w-full gap-2 md:w-auto">
            <select
              name="category"
              className="w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm font-semibold text-secondary focus:ring-2 focus:ring-primary/20 md:w-48"
              defaultValue={category}
            >
              <option value="">Semua Kategori</option>
              {CATEGORIES.map(({ group, items }) => (
                <optgroup key={group} label={group}>
                  {items.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button
              type="submit"
              className="flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary/90"
            >
              <Icon name="search" className="text-[18px]" />
              Cari
            </button>
          </div>
        </form>
      </section>

      {/* Result count */}
      {(search || category) && (
        <p className="mb-6 text-sm text-on-surface-variant">
          Menampilkan <strong>{total}</strong> buku
          {search && <> untuk pencarian &ldquo;<strong>{search}</strong>&rdquo;</>}
          {category && <> dalam kategori <strong>{category}</strong></>}
        </p>
      )}

      {/* Grid */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
        {books.length ? (
          books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isSaved={savedBookIds.includes(book.id)}
              isLoggedIn={isLoggedIn}
            />
          ))
        ) : (
          <div className="rounded-[2rem] bg-white p-8 shadow-sm lg:col-span-2">
            <h2 className="font-headline text-2xl font-extrabold">Buku tidak ditemukan</h2>
            <p className="mt-3 max-w-2xl text-on-surface-variant">
              Tidak ada buku yang cocok dengan pencarian atau filter Anda.
            </p>
          </div>
        )}
      </section>

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} params={paginationParams} />

      {totalPages > 1 && (
        <p className="mt-4 text-center text-xs text-on-surface-variant">
          Halaman {page} dari {totalPages} · {total} buku ditemukan
        </p>
      )}
    </>
  );
}
