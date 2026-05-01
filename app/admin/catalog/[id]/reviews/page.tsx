import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { getBookById, getReviews, requireAdminAccess } from "@/lib/supabase/data";
import { DeleteReviewButton } from "./DeleteReviewButton";

export default async function AdminBookReviewsPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdminAccess();
  const book = await getBookById(params.id);
  if (!book) notFound();

  const reviews = await getReviews(params.id);
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <AppShell mode="admin">
      {/* Header */}
      <section className="mb-8">
        <Link
          href="/admin/catalog"
          className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
        >
          <Icon name="arrow_back" className="text-[16px]" />
          Kembali ke Katalog
        </Link>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.28em] text-primary">
              Manajemen Ulasan
            </p>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight md:text-4xl line-clamp-1">
              {book.title}
            </h1>
            <p className="mt-1 text-sm text-slate-500">Oleh {book.author}</p>
          </div>
          {/* Rating summary */}
          <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-sm">
            <span className="font-headline text-4xl font-extrabold text-slate-800">
              {avgRating.toFixed(1)}
            </span>
            <div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    className={`text-lg ${s <= Math.round(avgRating) ? "text-amber-400" : "text-slate-200"}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-400">{reviews.length} ulasan</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabel Ulasan */}
      {reviews.length === 0 ? (
        <div className="rounded-[2rem] bg-white p-14 text-center shadow-sm">
          <Icon name="rate_review" className="mb-4 text-5xl text-outline" />
          <h2 className="font-headline text-2xl font-extrabold text-slate-700">Belum Ada Ulasan</h2>
          <p className="mt-2 text-sm text-slate-400">
            Belum ada siswa yang memberikan ulasan untuk buku ini.
          </p>
        </div>
      ) : (
        <section className="overflow-hidden rounded-[2rem] bg-surface-container-low">
          {/* Column Header */}
          <div className="hidden grid-cols-[1fr_80px_3fr_140px_50px] gap-4 px-6 py-4 text-xs font-black uppercase tracking-widest text-on-surface-variant md:grid">
            <span>Nama</span>
            <span>Rating</span>
            <span>Komentar</span>
            <span>Tanggal</span>
            <span>Aksi</span>
          </div>

          <div className="space-y-0.5">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="grid gap-3 bg-white px-6 py-4 transition hover:bg-surface-container-low md:grid-cols-[1fr_80px_3fr_140px_50px] md:items-center"
              >
                {/* Nama */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container font-bold text-primary text-xs">
                    {review.authorName.slice(0, 2).toUpperCase()}
                  </div>
                  <p className="font-bold text-sm text-slate-800">{review.authorName}</p>
                </div>

                {/* Rating */}
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className={`text-sm ${s <= review.rating ? "text-amber-400" : "text-slate-200"}`}
                    >
                      ★
                    </span>
                  ))}
                </div>

                {/* Komentar */}
                <p className="text-sm text-slate-600 line-clamp-2">
                  {review.comment || <span className="italic text-slate-400">Tanpa komentar</span>}
                </p>

                {/* Tanggal */}
                <p className="text-xs text-slate-400">
                  {new Date(review.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>

                {/* Aksi */}
                <DeleteReviewButton reviewId={review.id} bookId={params.id} />
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="mt-6 text-center text-sm text-on-surface-variant">
        Menampilkan <strong>{reviews.length}</strong> ulasan
      </p>
    </AppShell>
  );
}
