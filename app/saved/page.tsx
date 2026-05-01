import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { BookCover } from "@/components/BookCover";
import { Icon } from "@/components/Icon";
import { getSavedBooks, getCurrentProfile, isSupabaseConfigured } from "@/lib/supabase/data";

export default async function SavedBooksPage() {
  const auth = await getCurrentProfile();
  const showLoginHint = isSupabaseConfigured() && !auth.user;
  const savedBooks = await getSavedBooks();

  return (
    <AppShell>
      {/* Header */}
      <section className="mb-10 text-center md:text-left">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight md:text-5xl">Buku Tersimpan</h1>
        <p className="mt-3 text-on-surface-variant max-w-xl md:mx-0 mx-auto">
          Daftar wishlist dan buku favorit yang ingin Anda baca nanti.
        </p>
      </section>

      {/* Konten */}
      {savedBooks.length === 0 ? (
        <article className="rounded-[2rem] bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Icon name="bookmark_border" className="text-4xl" />
          </div>
          <h2 className="font-headline text-2xl font-extrabold text-slate-800">
            Belum ada buku tersimpan
          </h2>
          <p className="mt-3 text-on-surface-variant mx-auto max-w-md">
            {showLoginHint
              ? "Silakan login dulu untuk melihat daftar buku favorit Anda."
              : "Jelajahi katalog perpustakaan dan simpan buku yang menarik minat Anda untuk dibaca nanti."}
          </p>
          <Link
            href="/catalog"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white transition hover:bg-primary/90"
          >
            <Icon name="search" className="text-[18px]" />
            Jelajahi Katalog
          </Link>
        </article>
      ) : (
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {savedBooks.map((book, index) => (
            <Link key={book.id} href={`/catalog/${book.id}`} className="group flex flex-col">
              <div className="relative overflow-hidden rounded-[1.5rem] shadow-sm transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
                {/* Bookmark Badge */}
                <div className="absolute right-0 top-0 z-10 p-3 drop-shadow-md">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-white shadow-sm ring-2 ring-white">
                    <Icon name="bookmark" className="text-[16px]" />
                  </div>
                </div>
                <BookCover
                  title={book.title}
                  author={book.author}
                  coverUrl={book.coverUrl}
                  tone={index % 2 === 0 ? "blue" : "warm"}
                  className="aspect-[3/4] w-full"
                />
              </div>
              <div className="pr-4 pt-4">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#0ea5e9]">
                  {book.category || "Umum"}
                </p>
                <h3 className="font-headline text-sm font-extrabold leading-tight text-slate-800 line-clamp-2 md:text-base">
                  {book.title}
                </h3>
                <p className="mt-1 text-xs font-medium text-slate-500 line-clamp-1">{book.author}</p>
              </div>
            </Link>
          ))}
        </section>
      )}
    </AppShell>
  );
}
