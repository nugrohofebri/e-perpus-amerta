import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { BookCover } from "@/components/BookCover";
import { Icon } from "@/components/Icon";
import { BorrowInteractiveButton } from "@/components/BorrowInteractiveButton";
import { ReviewForm } from "@/components/ReviewForm";
import { SaveBookButton } from "@/components/SaveBookButton";
import { getBookById, getBooks, requireStudentAccess, getReviews, hasUserBorrowedBook, isBookSaved } from "@/lib/supabase/data";

type BookDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const book = await getBookById(params.id);
  const allBooks = await getBooks();
  const auth = await requireStudentAccess();
  const reviews = await getReviews(params.id);

  if (!book) {
    notFound();
  }

  const relatedBooks = allBooks.filter((b) => b.id !== book.id).slice(0, 4);
  const isAvailable = book.status === "available";
  const isLoggedIn = !!auth.user;
  const isStudentTeacherOrGuest = !auth.profile?.role || auth.profile?.role === "student" || auth.profile?.role === "teacher";

  // Kalkulasi rata-rata rating
  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length > 0 ? Math.round(reviews.filter(r => r.rating === star).length / reviews.length * 100) : 0
  }));

  // Cek apakah user sudah pernah review
  const myReview = reviews.find(r => r.authorId === auth.user?.id);

  // Cek apakah user pernah meminjam buku ini (hanya mereka yang boleh review)
  const hasBorrowed = await hasUserBorrowedBook(params.id);

  // Cek apakah buku sudah disimpan user
  const isSaved = await isBookSaved(params.id);

  return (
    <AppShell>
      <div className="mx-auto max-w-xl pb-10">
        
        {/* Header Back */}
        <div className="mb-8">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-primary"
          >
            <Icon name="arrow_back" className="text-lg" />
            Kembali ke Katalog
          </Link>
        </div>

        {/* Area Gambar Cover */}
        <div>
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
        </div>

        {/* Info & Subtitle */}
        <div className="mt-8">
          <div className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 font-bold uppercase tracking-widest text-blue-700 text-[10px]">
            {book.category?.toUpperCase() || "UMUM"}
          </div>
          <h1 className="mt-4 font-headline text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-5xl">
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

        {/* Panel Aksi (Putih) */}
        <div className="mt-10 rounded-[2.5rem] bg-white p-6 shadow-sm md:p-8">
          
          <div className="mb-8 flex items-center justify-between px-2">
            <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${isAvailable ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isAvailable ? "bg-green-500" : "bg-amber-500"}`} />
              {isAvailable ? "Tersedia Sekarang" : "Sedang Dipinjam"}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Masa Pinjam</p>
              <p className="font-headline text-sm font-extrabold text-slate-800">14 Hari</p>
            </div>
          </div>

          {isStudentTeacherOrGuest && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <BorrowInteractiveButton isLoggedIn={isLoggedIn} isAvailable={isAvailable} bookTitle={book.title} bookId={book.id} />
              {isLoggedIn && <SaveBookButton bookId={book.id} initialSaved={isSaved} />}
            </div>
          )}

          <div className="mt-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-900">Sinopsis</p>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
              {book.description || "Tidak ada sinopsis yang tersedia untuk judul ini."}
            </p>
          </div>

          {/* ── Section Review & Rating ── */}
          <div className="mt-14">
            {/* Header + rata-rata */}
            <div className="mb-6 flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-sm md:flex-row md:items-center">
              <div className="flex flex-col items-center justify-center gap-1 md:pr-8 md:border-r md:border-slate-100">
                <p className="font-headline text-6xl font-extrabold text-slate-800">{avgRating.toFixed(1)}</p>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={`text-xl ${s <= Math.round(avgRating) ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                  ))}
                </div>
                <p className="text-xs text-slate-400 font-medium">{reviews.length} ulasan</p>
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                {ratingCounts.map(({ star, pct, count }) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="w-4 text-xs font-bold text-slate-500">{star}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right text-xs text-slate-400">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Tambah / Edit Review — hanya untuk peminjam */}
            {hasBorrowed && (
              <div className="mb-6">
                <ReviewForm
                  bookId={book.id}
                  existingRating={myReview?.rating ?? 0}
                  existingComment={myReview?.comment ?? ""}
                />
              </div>
            )}

            {/* Daftar Ulasan */}
            <div className="space-y-4">
              <h3 className="font-headline text-xl font-extrabold text-slate-800">
                Ulasan Pembaca
              </h3>
              {reviews.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center">
                  <p className="font-bold text-slate-500">Belum ada ulasan</p>
                  <p className="mt-1 text-xs text-slate-400">Jadilah yang pertama memberikan ulasan!</p>
                </div>
              ) : reviews.map((review) => (
                <article key={review.id} className="rounded-3xl bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container font-bold text-primary">
                        {review.authorName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-800">{review.authorName}</p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(review.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={`text-sm ${s <= review.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{review.comment}</p>
                  )}
                </article>
              ))}
            </div>
          </div>

          {/* Rekomendasi Terkait */}
          {relatedBooks.length > 0 && (
            <div className="mt-14">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <h2 className="font-headline text-2xl font-extrabold tracking-tight text-slate-900">Pembaca juga menyukai</h2>
                  <p className="mt-1 text-xs font-medium text-slate-500">Disarankan untuk Anda</p>
                </div>
                <Link href="/catalog" className="text-xs font-bold text-[#0ea5e9] mb-1">
                  Lihat Katalog
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {relatedBooks.map(rb => (
                  <Link key={rb.id} href={`/catalog/${rb.id}`} className="group">
                    <BookCover title={rb.title} author={rb.author} coverUrl={rb.coverUrl} tone={rb.coverTone} className="w-full rounded-[1.5rem] shadow-sm transition group-hover:scale-105" />
                    <h3 className="mt-3 font-headline text-[13px] font-extrabold leading-tight text-slate-800 line-clamp-1">{rb.title}</h3>
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
