import { AppShell } from "@/components/AppShell";
import { BookCover } from "@/components/BookCover";
import { Icon } from "@/components/Icon";
import { ShowQRButton } from "@/components/ShowQRButton";
import { ReturnQRButton } from "@/components/ReturnQRButton";
import { getBorrowings, requireStudentAccess, isSupabaseConfigured } from "@/lib/supabase/data";
import Link from "next/link";

export default async function BorrowingsPage() {
  const auth = await requireStudentAccess();
  const borrowings = await getBorrowings();
  const showLoginHint = isSupabaseConfigured() && !auth.user;

  const activeItems = borrowings.filter(b => b.status === "Aktif");
  const pendingItems = borrowings.filter(b => b.status === "Menunggu");
  const historyItems = borrowings.filter(b => b.status === "Dikembalikan");

  return (
    <AppShell>
      {/* Header */}
      <section className="mb-10">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight md:text-5xl">Peminjaman Saya</h1>
        <p className="mt-3 max-w-xl leading-7 text-on-surface-variant">
          Pantau buku aktif, antrian menunggu petugas, dan riwayat pengembalian.
        </p>
      </section>

      <div>
        <section className="space-y-8">

          {/* Banner Instruksi QR jika ada pending */}
          {pendingItems.length > 0 && (
            <div className="flex items-start gap-4 rounded-[1.5rem] bg-amber-50 border border-amber-200 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <Icon name="qr_code" className="text-xl" />
              </div>
              <div>
                <p className="font-bold text-amber-800">Ada {pendingItems.length} buku menunggu verifikasi</p>
                <p className="mt-1 text-sm text-amber-700 leading-relaxed">
                  Tunjukkan <strong>QR Code</strong> yang didapat saat meminjam kepada petugas perpustakaan untuk mengambil buku Anda. QR hanya berlaku <strong>5 menit</strong> setelah dibuat.
                </p>
              </div>
            </div>
          )}

          {/* Daftar Peminjaman */}
          {borrowings.length === 0 ? (
            <article className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Icon name="library_books" className="text-3xl" />
              </div>
              <h2 className="font-headline text-2xl font-extrabold text-slate-800">Belum ada peminjaman</h2>
              <p className="mt-3 text-on-surface-variant">
                {showLoginHint ? "Silakan login dulu untuk melihat peminjaman milikmu." : "Belum ada transaksi. Coba pinjam buku dari katalog."}
              </p>
              <Link
                href="/catalog"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary/90"
              >
                <Icon name="search" className="text-[18px]" />
                Jelajahi Katalog
              </Link>
            </article>
          ) : (
            <div className="space-y-4">
              {borrowings.map((item, index) => {
                const isPending = item.status === "Menunggu";
                const isActive = item.status === "Aktif";
                const isDone = item.status === "Dikembalikan";

                return (
                  <article
                    key={item.id}
                    className={`flex flex-col gap-5 rounded-[2rem] p-6 shadow-sm md:flex-row ${isPending ? "bg-amber-50 border border-amber-100" : "bg-white"}`}
                  >
                    <BookCover
                      title={item.title}
                      author={item.author}
                      tone={index % 2 === 0 ? "blue" : "warm"}
                      coverUrl={item.coverUrl}
                      className="w-full shrink-0 md:w-28"
                    />
                    <div className="flex flex-1 flex-col justify-between gap-5">
                      <div>
                        {/* Badge Status */}
                        <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${isActive ? "bg-green-100 text-green-700" : isPending ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-green-500" : isPending ? "bg-amber-500" : "bg-slate-400"}`} />
                          {item.status}
                        </div>
                        <h2 className="mt-3 font-headline text-xl font-extrabold leading-snug">{item.title}</h2>
                        <p className="mt-1 text-sm font-medium text-on-surface-variant">{item.author}</p>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-600">
                          <Icon name="event" className="text-[16px] text-primary" />
                          {isActive ? `Kembali sebelum ${item.dueDate}` : isPending ? "Menunggu scan petugas" : `Dikembalikan pada ${item.dueDate}`}
                        </div>
                        {isActive && (
                          <ReturnQRButton borrowingId={item.id} bookTitle={item.title} />
                        )}
                        {isPending && (
                          <ShowQRButton borrowingId={item.id} bookTitle={item.title} createdAt={item.createdAt} />
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
