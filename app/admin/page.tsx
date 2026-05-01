import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { BookCover } from "@/components/BookCover";
import { getBooks, getBorrowings, getMembers, requireAdminAccess } from "@/lib/supabase/data";

export default async function AdminDashboardPage() {
  const auth = await requireAdminAccess();
  const books = await getBooks();
  const borrowings = await getBorrowings();
  const members = await getMembers();

  // Top Peminjam Bulan Ini
  const topMembers = [...members]
    .filter(m => m.activeBorrowings > 0)
    .sort((a, b) => b.activeBorrowings - a.activeBorrowings)
    .slice(0, 5);

  // Peminjaman Berisiko (Overdue atau sisa <= 3 hari)
  const riskBorrowings = borrowings.filter((b) => {
    if (b.status === "Terlambat") return true;
    if (b.status === "Aktif" && typeof b.daysRemaining === "number" && b.daysRemaining <= 3) return true;
    return false;
  }).slice(0, 6);

  return (
    <AppShell mode="admin">
      <section className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.28em] text-primary">
            Institutional Dashboard
          </p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight md:text-5xl">Overview</h1>
        </div>

        {/* Tombol Aksi Cepat / Shortcut */}
        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row items-center">
          <Link
            href="/admin/members?new=true"
            className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-surface-container-high bg-transparent px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-surface-container-low hover:text-slate-900 md:w-auto"
          >
            <Icon name="person_add" className="text-[18px]" />
            Tambah Anggota
          </Link>
          <Link
            href="/admin/books/new"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-primary/90 active:scale-95 md:w-auto"
          >
            <Icon name="library_add" className="text-[18px]" />
            Tambah Buku
          </Link>
        </div>
      </section>

      {/* Navigasi dihapus sesuai permintaan */}

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <MetricCard icon="auto_stories" label="Total Buku" value={String(books.length)} />
        <MetricCard icon="inventory_2" label="Eksemplar" value={String(books.reduce((sum, book) => sum + book.copies, 0))} />
        <MetricCard icon="group" label="Anggota Aktif" value={String(members.length)} />
        <MetricCard icon="warning" label="Overdue" value={String(borrowings.filter((b) => b.status === "Terlambat").length)} highlight />
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        
        {/* Kiri: Live Overdue */}
        <section className="rounded-[2rem] bg-surface-container-low p-7 md:col-span-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-headline text-xl font-extrabold">Peminjaman Berisiko (Live)</h2>
            <Link href="/admin/borrowings" className="text-sm font-bold text-primary">Lihat Semua</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {riskBorrowings.length > 0 ? riskBorrowings.map((b) => (
              <div key={b.id} className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm border border-transparent transition hover:border-red-100">
                <div className="flex gap-4">
                  <BookCover title={b.title} author={b.author} coverUrl={b.coverUrl} className="w-16 h-20 shrink-0 rounded-lg" />
                  <div className="flex flex-1 flex-col justify-center min-w-0">
                    <p className="font-bold text-sm text-slate-900 line-clamp-1">{b.title}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">Peminjam: <strong className="font-bold text-slate-700">{b.borrowerName || "-"}</strong></p>
                    {b.status === "Terlambat" ? (
                      <div className="inline-flex rounded-full bg-red-100 px-2 py-1 text-[10px] font-extrabold text-red-700 self-start">
                        Overdue {b.daysRemaining ? Math.abs(b.daysRemaining) : "X"} Hari
                      </div>
                    ) : (
                      <div className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-[10px] font-extrabold text-amber-700 self-start">
                        Sisa {b.daysRemaining} Hari
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full rounded-2xl bg-white p-8 text-center border border-dashed border-slate-200">
                <p className="font-bold text-slate-600">Aman!</p>
                <p className="mt-1 text-xs text-slate-400">Tidak ada peminjaman yang berisiko kadaluarsa saat ini.</p>
              </div>
            )}
          </div>
        </section>

        {/* Kanan: Top Peminjam */}
        <section className="rounded-[2rem] bg-white p-7 shadow-sm md:col-span-4 border border-surface-container">
          <h2 className="font-headline text-xl font-extrabold mb-6">Top Peminjam</h2>
          <div className="space-y-4">
            {topMembers.length > 0 ? topMembers.map((member, idx) => (
              <div key={member.id} className="flex items-center gap-4">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm ${idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-slate-200 text-slate-600' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-surface-container-low text-slate-400'}`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-800 line-clamp-1">{member.name}</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{member.displayId}</p>
                </div>
                <div className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-lg px-3 py-1.5 min-w-[3rem]">
                  <span className="font-extrabold text-lg leading-none">{member.activeBorrowings}</span>
                </div>
              </div>
            )) : (
              <div className="text-center p-4">
                <p className="text-xs text-slate-400">Belum ada anggota yang meminjam bulan ini.</p>
              </div>
            )}
          </div>
          {topMembers.length > 0 && (
            <Link href="/admin/members" className="mt-6 block text-center text-xs font-bold text-primary hover:underline">
              Lihat Direktori Anggota
            </Link>
          )}
        </section>

      </div>
    </AppShell>
  );
}

function MetricCard({
  icon,
  label,
  value,
  highlight = false,
  className = ""
}: {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className={`${className} flex h-32 flex-col justify-between rounded-[1.5rem] p-5 shadow-sm ${highlight ? "bg-red-50 text-red-900 border border-red-100" : "bg-white"}`}>
      <div className="flex items-center justify-between">
        <p className="font-headline text-3xl font-extrabold">{value}</p>
        <Icon name={icon} className={`text-2xl ${highlight ? "text-red-500" : "text-primary/40"}`} />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{label}</p>
    </div>
  );
}
