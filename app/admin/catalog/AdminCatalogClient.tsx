"use client";

import { useState } from "react";
import Link from "next/link";
import { BookCover } from "@/components/BookCover";
import { DeleteBookButton } from "@/components/DeleteBookButton";
import { Icon } from "@/components/Icon";
import { StatusChip } from "@/components/StatusChip";
import type { Book } from "@/lib/types";

// Extracted the unique categories from our existing predefined ones (from CatalogClient)
const PREDEFINED_CATEGORIES = ["Buku Pelajaran", "Novel", "Komik", "Biografi"];

export function AdminCatalogClient({ books, totalCopies, borrowed }: { books: Book[], totalCopies: number, borrowed: number }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const allCategories = Array.from(new Set(books.map((b) => b.category).filter(Boolean)));
  const categories = Array.from(new Set([...PREDEFINED_CATEGORIES, ...allCategories]));

  const filteredBooks = books.filter((book) => {
    const matchSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      book.category.toLowerCase().includes(search.toLowerCase());

    const matchCategory = category ? book.category === category || category === "Kategori" ? true : book.category === category : true;
    
    // Status translation (buku enum: available, borrowed, pending)
    // Filter options UI: "Status", "Tersedia", "Dipinjam", "Antrian" (maybe)
    let matchStatus = true;
    if (statusFilter && statusFilter !== "Status" && statusFilter !== "Semua Status") {
      if (statusFilter === "Tersedia" && book.status !== "available") matchStatus = false;
      if (statusFilter === "Dipinjam" && book.status !== "borrowed") matchStatus = false;
      if (statusFilter === "Antrian" && book.status !== "pending") matchStatus = false;
    }

    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 rounded-[2rem] bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div className="relative flex-1">
          <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
          <input
            className="w-full rounded-2xl border-0 bg-surface-container-high py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20"
            placeholder="Cari judul, penulis, kategori..."
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="rounded-2xl border-0 bg-surface-container px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            className="rounded-2xl border-0 bg-surface-container px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="Tersedia">Tersedia</option>
            <option value="Dipinjam">Dipinjam</option>
            <option value="Antrian">Antrian</option>
          </select>
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="rounded-[2rem] bg-white p-12 text-center shadow-sm">
          <Icon name="library_books" className="mb-4 text-6xl text-outline" />
          <h2 className="font-headline text-2xl font-extrabold">Buku tidak ditemukan</h2>
          <p className="mt-3 text-on-surface-variant">
            {books.length === 0
              ? "Mulai tambahkan koleksi buku perpustakaan sekolah."
              : "Tidak ada buku yang cocok dengan pencarian atau filter Anda."}
          </p>
          {books.length === 0 && (
            <Link
              href="/admin/books/new"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 font-bold text-white"
            >
              <Icon name="add" />
              Tambah Buku Pertama
            </Link>
          )}
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
            {filteredBooks.map((book) => {
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
                    <p className="mt-1 text-xs text-outline">{book.grade}</p>
                  </div>

                  <p className="text-sm font-medium text-on-surface-variant">{book.category}</p>

                  <div className="flex items-center gap-1">
                    <span className="font-headline text-2xl font-extrabold text-primary">
                      {book.copies}
                    </span>
                    <span className="text-xs text-outline">eks</span>
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
                      href={`/catalog/${book.id}`}
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

      <p className="mt-6 text-center text-sm text-on-surface-variant">
        Menampilkan <strong>{filteredBooks.length}</strong> dari <strong>{books.length}</strong> judul buku ·{" "}
        <strong>{totalCopies}</strong> total eksemplar ·{" "}
        <strong>{borrowed}</strong> sedang dipinjam
      </p>
    </>
  );
}
