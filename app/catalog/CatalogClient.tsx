"use client";

import { useState } from "react";
import { BookCard } from "@/components/BookCard";
import { Icon } from "@/components/Icon";
import type { Book } from "@/lib/types";

// Extracted the unique categories from our existing predefined ones
const PREDEFINED_CATEGORIES = ["Buku Pelajaran", "Novel", "Komik", "Biografi"];

export function CatalogClient({ books, savedBookIds = [], initialCategory = "", isLoggedIn = false }: { books: Book[], savedBookIds?: string[], initialCategory?: string, isLoggedIn?: boolean }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);

  // Get all unique categories dynamically in case there are custom ones
  const allCategories = Array.from(new Set(books.map((b) => b.category).filter(Boolean)));
  // Merge predefined with custom categories
  const categories = Array.from(new Set([...PREDEFINED_CATEGORIES, ...allCategories]));

  const filteredBooks = books.filter((book) => {
    const matchSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase());

    const matchCategory = category ? book.category === category : true;

    return matchSearch && matchCategory;
  });

  return (
    <>
      <section className="mb-12">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight md:text-6xl">
          Temukan bacaan berikutnya.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-on-surface-variant">
          Katalog buku akademik, literatur klasik, dan bacaan populer yang siap dipinjam.
        </p>

        <div className="mt-10 flex flex-col gap-3 rounded-[2rem] bg-surface-container-high p-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
            <input
              className="w-full rounded-2xl border-0 bg-transparent py-4 pl-12 pr-4 font-medium focus:ring-0"
              placeholder="Cari judul, penulis..."
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex w-full gap-2 md:w-auto">
            <select
              className="w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm font-semibold text-secondary focus:ring-2 focus:ring-primary/20 md:w-48"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
        {filteredBooks.length ? (
          filteredBooks.map((book) => <BookCard key={book.id} book={book} isSaved={savedBookIds.includes(book.id)} isLoggedIn={isLoggedIn} />)
        ) : (
          <div className="rounded-[2rem] bg-white p-8 shadow-sm lg:col-span-2">
            <h2 className="font-headline text-2xl font-extrabold">Buku tidak ditemukan</h2>
            <p className="mt-3 max-w-2xl text-on-surface-variant">
              {books.length === 0
                ? "Belum ada buku di katalog. Tunggu admin menambahkan koleksi."
                : "Tidak ada buku yang cocok dengan pencarian atau filter Anda."}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
