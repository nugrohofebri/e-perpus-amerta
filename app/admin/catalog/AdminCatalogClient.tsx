"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookCover } from "@/components/BookCover";
import { DeleteBookButton } from "@/components/DeleteBookButton";
import { Icon } from "@/components/Icon";
import { StatusChip } from "@/components/StatusChip";
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
  total: number;
  page: number;
  totalPages: number;
  search: string;
  category: string;
  statusFilter: string;
  copiesFilter: string;
  borrowed: number;
  totalCopies: number;
}

export function AdminCatalogClient({
  books,
  total,
  page,
  totalPages,
  search,
  category,
  statusFilter,
  copiesFilter,
  borrowed,
  totalCopies,
}: Props) {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    const s = data.get("search") as string;
    const c = data.get("category") as string;
    const st = data.get("status") as string;
    const cp = data.get("copies") as string;
    if (s) params.set("search", s);
    if (c) params.set("category", c);
    if (st) params.set("status", st);
    if (cp) params.set("copies", cp);
    params.set("page", "1");
    router.push(`/admin/catalog?${params.toString()}`);
  }

  // Params untuk Pagination (tanpa page)
  const paginationParams: Record<string, string> = {};
  if (search) paginationParams.search = search;
  if (category) paginationParams.category = category;
  if (statusFilter) paginationParams.status = statusFilter;
  if (copiesFilter) paginationParams.copies = copiesFilter;

  return (
    <>
      {/* Search & Filter Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 flex flex-col gap-3 rounded-[2rem] bg-white p-4 shadow-sm md:flex-row md:items-center"
      >
        <div className="relative flex-1">
          <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
          <input
            className="w-full rounded-2xl border-0 bg-surface-container-high py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20"
            placeholder="Cari judul, penulis... lalu tekan Enter atau klik Cari"
            type="search"
            name="search"
            defaultValue={search}
          />
        </div>
        <div className="flex gap-2">
          <select
            name="category"
            className="rounded-2xl border-0 bg-surface-container px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20"
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
          <select
            name="status"
            className="rounded-2xl border-0 bg-surface-container px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20"
            defaultValue={statusFilter}
          >
            <option value="">Semua Status</option>
            <option value="available">Tersedia</option>
            <option value="borrowed">Dipinjam</option>
          </select>
          <select
            name="copies"
            className="rounded-2xl border-0 bg-surface-container px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20"
            defaultValue={copiesFilter}
          >
            <option value="">Semua Stok</option>
            <option value="0">0 eksemplar</option>
            <option value="1">1 eksemplar</option>
            <option value="2">2 eksemplar</option>
            <option value="3">3 eksemplar</option>
            <option value="4">4 eksemplar</option>
            <option value="5">5 eksemplar</option>
            <option value="5plus">5+ eksemplar</option>
          </select>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary/90"
          >
            <Icon name="search" className="text-[18px]" />
            Cari
          </button>
        </div>
      </form>

      {/* Table */}
      {books.length === 0 ? (
        <div className="rounded-[2rem] bg-white p-12 text-center shadow-sm">
          <Icon name="library_books" className="mb-4 text-6xl text-outline" />
          <h2 className="font-headline text-2xl font-extrabold">Buku tidak ditemukan</h2>
          <p className="mt-3 text-on-surface-variant">
            Tidak ada buku yang cocok dengan filter Anda.
          </p>
        </div>
      ) : (
        <section className="overflow-hidden rounded-[2rem] bg-surface-container-low">
          <div className="hidden grid-cols-[60px_1fr_160px_120px_100px_120px] gap-4 px-6 py-4 text-xs font-black uppercase tracking-widest text-on-surface-variant md:grid">
            <span>Cover</span>
            <span>Buku</span>
            <span>Kategori</span>
            <span>Stok</span>
            <span>Status</span>
            <span>Aksi</span>
          </div>

          <div className="space-y-0.5">
            {books.map((book) => {
              const tone =
                book.status === "available"
                  ? "success"
                  : book.status === "pending"
                  ? "pending"
                  : "neutral";

              return (
                <div
                  key={book.id}
                  className="grid gap-4 bg-white px-6 py-4 transition hover:bg-surface-container-low md:grid-cols-[60px_1fr_160px_120px_100px_120px] md:items-center"
                >
                  <BookCover
                    title={book.title}
                    author={book.author}
                    tone={book.coverTone}
                    coverUrl={book.coverUrl}
                    className="h-16 w-12 shrink-0 overflow-hidden rounded-lg"
                  />
                  <div>
                    <p className="font-bold leading-tight">{book.title}</p>
                    <p className="mt-0.5 text-sm text-on-surface-variant">{book.author}</p>
                  </div>
                  <p className="text-sm font-medium text-on-surface-variant">{book.category}</p>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="font-headline text-2xl font-extrabold text-primary">
                        {book.copies}
                      </span>
                      <span className="text-xs text-outline">/ {book.totalCopies ?? book.copies}</span>
                    </div>
                    <span className="text-[10px] text-outline">tersedia / total</span>
                  </div>
                  <StatusChip tone={tone}>
                    {book.status === "available"
                      ? "Tersedia"
                      : book.status === "pending"
                      ? "Antrian"
                      : "Dipinjam"}
                  </StatusChip>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/catalog/${book.id}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container text-primary transition hover:bg-primary hover:text-white"
                      title="Lihat detail"
                    >
                      <Icon name="visibility" className="text-[18px]" />
                    </Link>
                    <Link
                      href={`/admin/catalog/${book.id}/reviews`}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container text-amber-600 transition hover:bg-amber-100"
                      title="Lihat ulasan"
                    >
                      <Icon name="rate_review" className="text-[18px]" />
                    </Link>
                    <Link
                      href={`/admin/books/new?edit=${book.id}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container text-primary transition hover:bg-primary hover:text-white"
                      title="Edit buku"
                    >
                      <Icon name="edit" className="text-[18px]" />
                    </Link>
                    <DeleteBookButton bookId={book.id} bookTitle={book.title} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} params={paginationParams} />

      <p className="mt-6 text-center text-sm text-on-surface-variant">
        Menampilkan <strong>{books.length}</strong> dari <strong>{total}</strong> judul buku ·{" "}
        <strong>{totalCopies}</strong> total eksemplar · <strong>{borrowed}</strong> sedang dipinjam
        {totalPages > 1 && (
          <> · Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong></>
        )}
      </p>
    </>
  );
}
