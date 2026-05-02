import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { BookCover } from "@/components/BookCover";
import { Icon } from "@/components/Icon";
import { StatusChip } from "@/components/StatusChip";
import { getBooks, getBorrowings, requireStudentAccess } from "@/lib/supabase/data";

export default async function StudentDashboardPage() {
  const auth = await requireStudentAccess();
  const books = await getBooks();
  const borrowings = await getBorrowings();
  const featured = books[0] ?? null;

  // --- Dynamic Category Aggregation ---
  const categoryMap = new Map<string, number>();
  books.forEach((book) => {
    const cat = book.category?.trim() || "Pelajaran";
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
  });

  const categoryStyles = [
    { icon: "menu_book", colorWrapper: "bg-[#F0F5FF] text-[#2563EB]" }, // Soft Blue
    { icon: "edit", colorWrapper: "bg-[#F8F5FF] text-[#9333EA]" }, // Soft Purple
    { icon: "psychology", colorWrapper: "bg-[#FFF8F0] text-[#EA580C]" }, // Soft Orange
    { icon: "account_balance", colorWrapper: "bg-[#F0FDF4] text-[#16A34A]" }, // Soft Green
    { icon: "menu_book", colorWrapper: "bg-[#FDF4FF] text-[#C026D3]" }, // Soft Fuchsia
    { icon: "edit", colorWrapper: "bg-[#F0FDFA] text-[#0D9488]" }, // Soft Teal
  ];

  const dynamicCategories = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1]) // highest count first
    .map(([title, count], index) => ({
      title,
      count: `${count} Judul`,
      ...categoryStyles[index % categoryStyles.length],
    }));

  const otherPicks = books.slice(1, 4);

  return (
    <AppShell>
      <section className="mb-12">
        <div className="flex flex-col gap-6">
          <div>
            {auth.user && auth.profile ? (
              <>
                <p className="font-headline text-lg font-bold text-on-surface-variant">
                  Halo, {auth.profile.fullName.split(" ")[0]}! 👋
                </p>
                <h1 className="mt-1 font-headline text-4xl font-extrabold tracking-tight md:text-6xl">
                  Selamat datang di E-Perpus Amerta.
                </h1>
              </>
            ) : (
              <h1 className="font-headline text-4xl font-extrabold tracking-tight md:text-6xl">
                Selamat datang di E-Perpus Amerta.
              </h1>
            )}
            <p className="mt-4 max-w-2xl text-on-surface-variant">
              Jelajahi katalog, ajukan peminjaman, pantau batas pengembalian, dan kelola aktivitas baca dari satu tempat.
            </p>
          </div>
        </div>
      </section>

      <div className="mb-12 grid gap-4 md:grid-cols-2">
        <Link
          href="/catalog"
          className="flex items-center justify-center gap-3 rounded-full bg-gradient-to-br from-primary to-primary-container px-8 py-5 font-bold text-white shadow-soft transition hover:scale-[1.01] active:scale-95 md:col-span-1"
        >
          <Icon name="auto_stories" />
          Telusuri Katalog
        </Link>
        {auth.user ? (
          <Link
            href="/borrowings"
            className="flex items-center justify-center gap-3 rounded-full bg-white px-8 py-5 font-bold text-primary shadow-sm transition hover:bg-surface-bright active:scale-95"
          >
            <Icon name="history_edu" />
            Peminjaman Saya
          </Link>
        ) : null}
      </div>

      {/* For You Section */}
      <h2 className="mb-6 font-headline text-2xl font-extrabold">Untuk Anda</h2>
      <section className="mb-12 grid gap-4 md:grid-cols-3">
        {featured ? (
          <div className="relative flex min-h-[360px] flex-col justify-between overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#DCE4E3] to-[#C8D6D5] p-8 md:col-span-2">
            <div className="relative z-10 w-full md:w-3/5">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#005B96]">
                Rekomendasi Utama
              </p>
              <h3 className="font-headline text-3xl font-extrabold leading-tight text-[#22333B] md:text-4xl lg:text-5xl">
                {featured.title}
              </h3>
              <p className="mt-4 text-sm leading-6 text-[#4A5D5C] line-clamp-3">
                Sebuah karya oleh {featured.author}. {featured.description}
              </p>

              <Link
                href={`/catalog/${featured.id}`}
                className="mt-8 inline-flex rounded-full bg-[#005B96] px-8 py-3.5 text-sm font-bold text-white transition hover:bg-[#004A7A]"
              >
                Lihat Detail
              </Link>
            </div>
            {featured.coverUrl && (
              <div className="absolute -bottom-16 -right-12 z-0 w-64 rotate-12 opacity-40 transition-all duration-500 hover:-translate-y-4 hover:rotate-6 hover:opacity-90 md:-bottom-20 md:-right-6 md:w-80 lg:opacity-80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featured.coverUrl} className="w-full rounded-xl object-cover shadow-2xl" alt="" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full min-h-60 flex-col justify-center rounded-[2rem] bg-white p-6 shadow-sm md:col-span-2">
            <StatusChip tone="neutral">Katalog kosong</StatusChip>
            <h3 className="mt-4 font-headline text-2xl font-extrabold">Belum ada buku tersedia</h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-on-surface-variant">
              Tambahkan buku dari dashboard admin agar katalog dan rekomendasi tampil di sini.
            </p>
            <Link
              href="/admin/books/new"
              className="mt-6 inline-flex w-fit rounded-full bg-surface-container px-5 py-2.5 text-xs font-bold text-on-surface"
            >
              Tambah Buku
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-4 md:col-span-1">
          {otherPicks.map((book) => (
            <Link
              key={book.id}
              href={`/catalog/${book.id}`}
              className="group flex flex-1 items-center gap-5 rounded-[1.5rem] bg-white p-4 shadow-sm transition hover:bg-surface-bright hover:shadow-md"
            >
              <div className="w-16 shrink-0">
                <BookCover
                  title={book.title}
                  author={book.author}
                  coverUrl={book.coverUrl}
                  tone={book.coverTone}
                  className="w-full rounded-lg"
                />
              </div>
              <div className="flex flex-col justify-center">
                <h4 className="font-headline text-base font-extrabold leading-snug text-[#22333B] line-clamp-2 group-hover:text-primary">
                  {book.title}
                </h4>
                <p className="mt-1 text-xs font-medium text-on-surface-variant line-clamp-1">{book.author}</p>
              </div>
            </Link>
          ))}
          {otherPicks.length === 0 && (
            <div className="flex h-full items-center justify-center rounded-[1.5rem] bg-surface-container-low p-6 text-center text-sm font-medium text-on-surface-variant">
              Tidak ada rekomendasi buku lainnya saat ini.
            </div>
          )}
        </div>
      </section>

      {/* Explore Categories Section */}
      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-headline text-2xl font-extrabold">Eksplor Kategori</h2>
          <Link className="text-sm font-bold text-primary" href="/catalog">
            Lihat Semua
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {dynamicCategories.length > 0 ? (
            dynamicCategories.map((cat) => (
              <Link
                key={cat.title}
                href={`/catalog?category=${encodeURIComponent(cat.title)}`}
                className="group flex flex-col rounded-[2rem] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)]"
              >
                <div
                  className={`mb-10 flex h-14 w-14 items-center justify-center rounded-2xl ${cat.colorWrapper} transition-transform group-hover:scale-110`}
                >
                  <Icon name={cat.icon} className="text-2xl" />
                </div>
                <div className="mt-auto">
                  <h3 className="font-headline text-lg font-bold text-on-surface">{cat.title}</h3>
                  <p className="mt-1 text-sm font-medium text-on-surface-variant">{cat.count}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full rounded-2xl bg-white p-6 text-center shadow-sm">
              <p className="text-sm font-medium text-on-surface-variant">Belum ada kategori buku.</p>
            </div>
          )}
        </div>
      </section>

      {auth.user ? (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-headline text-2xl font-extrabold">Status Peminjaman</h2>
            <Link className="text-sm font-bold text-primary" href="/borrowings">
              Lihat Semua
            </Link>
          </div>
          <div className="rounded-[2rem] bg-surface-container-low p-6">
            <div className="grid gap-4 md:grid-cols-3">
              {borrowings.length ? borrowings.map((item) => (
                <div key={item.id} className="rounded-2xl bg-white p-5">
                  <StatusChip tone={item.status === "Aktif" ? "success" : item.status === "Menunggu" ? "pending" : item.status === "Terlambat" ? "danger" : "neutral"}>
                    {item.status}
                  </StatusChip>
                  <h3 className="mt-4 font-headline text-lg font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm text-on-surface-variant">{item.author}</p>
                  <p className="mt-6 text-xs font-bold uppercase tracking-widest text-primary">{item.dueDate}</p>
                </div>
              )) : (
                <div className="rounded-2xl bg-white p-5 md:col-span-3">
                  <p className="font-bold">Belum ada transaksi.</p>
                  <p className="mt-2 text-sm text-on-surface-variant">Ajukan peminjaman buku untuk melihat status di sini.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}
