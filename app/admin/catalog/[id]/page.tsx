import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { BookCover } from "@/components/BookCover";
import { Icon } from "@/components/Icon";
import { StatusChip } from "@/components/StatusChip";
import { getBookById, getBooks, requireAdminAccess, getReviews } from "@/lib/supabase/data";

type BookDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function AdminBookDetailPage({ params }: BookDetailPageProps) {
  await requireAdminAccess();

  const book = await getBookById(params.id);
  if (!book) notFound();

  const allBooks = await getBooks();
  const reviews = await getReviews(params.id);
  const relatedBooks = allBooks.filter((b) => b.id !== book.id).slice(0, 4);

  const isAvailable = book.status === "available";
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct:
      reviews.length > 0
        ? Math.round(
            (reviews.filter((r) => r.rating === star).length / reviews.length) * 100
          )
        : 0,
  }));

  const tone =
    book.status === "available"
      ? "success"
      : book.status === "pending"
      ? "pending"
      : "neutral";

  return (
    <AppShell>
      <div className="mx-auto max-w-xl pb-10">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm text-on-surface-variant">
          <Link href="/admin" className="hover:text-primary transition">
            Dashboard
          </Link>
          <Icon name="chevron_right" className="text-base" />
          <Link href="/admin/catalog" className="hover:text-primary transition">
            Katalog
          </Link>
          <Icon name="chevron_right" className="text-base" />
          <span className="font-semibold text-on-surface line-clamp-1">{book.title}</span>
        </div>

        {/* Cover */}
        <div className="flex w-full items-center justify-center rounded-[2.5rem] bg-gradient-to-b from-[#F1F5F9] to-[#E2E8F0] p-10 shadow-inner">
          <div className="w-48 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] transition-transform hover:scale-105">
            <BookCover
              title={book.title}
              author={book.author}
              tone={book.coverTone}
              coverUrl={book.coverUrl}
              className="w-full rounded-md"
            />
          </div>
        </div>

        {/* Info */}
        <div className="mt-8">
          <div className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 font-bold uppercase tracking-widest text-blue-700 text-[10px]">
            {book.category?.toUpperCase() || "UMUM"}
          </div>
          <h1 className="mt-4 font-headline text-4xl font-extrabold leading-tight tracking-tight text-slate-900">
            {book.title}
          </h1>
          <p className="mt-2 text-base font-medium text-slate-600">
            Oleh {book.author}
            {book.createdAt && (
              <>
                <span className="mx-2 text-slate-300">•</span>
                Ditambahkan {book.createdAt}
              </>
            )}
          </p>
        </div>

        {/* Status & Actions */}
        <div className="mt-10 rounded-[2.5rem] bg-white p-6 shadow-sm md:p-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 px-2">
            <div className="flex items-center gap-3">
              <StatusChip tone={tone}>
                {book.status === "available"
                  ? "Tersedia"
                  : book.status === "pending"
                  ? "Antrian"
                  : "Dipinjam"}
              </StatusChip>
              <span className="text-sm text-on-surface-variant">
                <strong>{book.copies}</strong> eksemplar
              </span>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/catalog/${book.id}/reviews`}
                className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 transition hover:bg-amber-100"
              >
                <Icon name="rate_review" className="text-[16px]" />
                Lihat Ulasan
              </Link>
              <Link
                href={`/admin/books/new?edit=${book.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary/90"
              >
                <Icon name="edit" className="text-[16px]" />
                Edit Buku
              </Link>
            </div>
          </div>

          {/* Sinopsis */}
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-900">
              Sinopsis
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
              {book.description || "Tidak ada sinopsis yang tersedia untuk judul ini."}
            </p>
          </div>

          {/* Rating & Ulasan */}
          <div className="mt-14">
            <div className="mb-6 flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-sm md:flex-row md:items-center">
              <div className="flex flex-col items-center justify-center gap-1 md:border-r md:border-slate-100 md:pr-8">
                <p className="font-headline text-6xl font-extrabold text-slate-800">
                  {avgRating.toFixed(1)}
                </p>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className={`text-xl ${
                        s <= Math.round(avgRating) ? "text-amber-400" : "text-slate-200"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-xs font-medium text-slate-400">{reviews.length} ulasan</p>
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                {ratingCounts.map(({ star, pct }) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="w-4 text-xs font-bold text-slate-500">{star}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs text-slate-400">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Daftar Ulasan */}
            <div className="space-y-4">
              <h2 className="font-headline text-xl font-extrabold text-slate-800">
                Ulasan Pembaca
              </h2>
              {reviews.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center">
                  <p className="font-bold text-slate-500">Belum ada ulasan</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <article key={review.id} className="rounded-3xl bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container font-bold text-primary">
                          {review.authorName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800">{review.authorName}</p>
                          <p className="text-[11px] text-slate-400">
                            {new Date(review.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span
                            key={s}
                            className={`text-sm ${
                              s <= review.rating ? "text-amber-400" : "text-slate-200"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">
                        {review.comment}
                      </p>
                    )}
                  </article>
                ))
              )}
            </div>
          </div>

          {/* Buku Terkait */}
          {relatedBooks.length > 0 && (
            <div className="mt-14">
              <div className="mb-6 flex items-end justify-between">
                <h2 className="font-headline text-2xl font-extrabold tracking-tight text-slate-900">
                  Buku Lainnya
                </h2>
                <Link
                  href="/admin/catalog"
                  className="text-xs font-bold text-primary mb-1"
                >
                  Lihat Katalog
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {relatedBooks.map((rb) => (
                  <Link key={rb.id} href={`/admin/catalog/${rb.id}`} className="group">
                    <BookCover
                      title={rb.title}
                      author={rb.author}
                      coverUrl={rb.coverUrl}
                      tone={rb.coverTone}
                      className="w-full rounded-[1.5rem] shadow-sm transition group-hover:scale-105"
                    />
                    <h3 className="mt-3 font-headline text-[13px] font-extrabold leading-tight text-slate-800 line-clamp-1">
                      {rb.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{rb.author}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
