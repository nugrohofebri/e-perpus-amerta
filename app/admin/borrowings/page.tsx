import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { StatusChip } from "@/components/StatusChip";
import { getBorrowings, requireAdminAccess } from "@/lib/supabase/data";
import Link from "next/link";

export default async function AdminBorrowingsPage() {
  await requireAdminAccess();
  const borrowings = await getBorrowings();

  const totalBorrowings = borrowings.length;
  const activeCount = borrowings.filter((b) => b.status === "Aktif").length;
  const overdueCount = borrowings.filter((b) => b.status === "Terlambat").length;

  return (
    <AppShell mode="admin">
      {/* Header */}
      <section className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.28em] text-primary">
            Sirkulasi
          </p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight md:text-5xl">
            Sirkulasi & Peminjaman
          </h1>
          <p className="mt-3 max-w-xl text-on-surface-variant">
            Pantau seluruh aktivitas peminjaman, persetujuan antrean, hingga pengembalian buku bacaan oleh anggota.
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {[
          { icon: "assignment", label: "Total Transaksi", value: totalBorrowings, highlight: false },
          { icon: "warning", label: "Overdue (Terlambat)", value: overdueCount, highlight: true },
          { icon: "import_contacts", label: "Aktif Dipinjam", value: activeCount, highlight: false },
        ].map(({ icon, label, value, highlight }) => (
          <div
            key={label}
            className={`flex flex-col gap-1 rounded-2xl p-5 shadow-sm ${highlight ? "bg-amber-100 text-amber-900" : "bg-white"}`}
          >
            <Icon name={icon} className={`text-2xl ${highlight ? "text-amber-600" : "text-primary"}`} />
            <p className="font-headline text-3xl font-extrabold">{value}</p>
            <p className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-surface-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-surface-container bg-surface-container-low text-on-surface-variant">
                <th className="whitespace-nowrap px-6 py-4 font-bold">Buku & Penulis</th>
                <th className="whitespace-nowrap px-6 py-4 font-bold">Status</th>
                <th className="whitespace-nowrap px-6 py-4 font-bold">Tenggat Waktu</th>
                <th className="whitespace-nowrap px-6 py-4 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {borrowings.map((borrow) => {
                const isPending = borrow.status === "Menunggu";
                const isActive = borrow.status === "Aktif";
                const isOverdue = borrow.status === "Terlambat";
                
                let badgeColors = 'bg-slate-100 text-slate-600';
                let dotColors = 'bg-slate-400';
                
                if (isActive) { badgeColors = 'bg-green-100 text-green-700'; dotColors = 'bg-green-500'; }
                else if (isPending) { badgeColors = 'bg-amber-100 text-amber-700'; dotColors = 'bg-amber-500'; }
                else if (isOverdue) { badgeColors = 'bg-red-100 text-red-700'; dotColors = 'bg-red-500'; }
                
                return (
                  <tr key={borrow.id} className="transition hover:bg-surface-bright">
                    <td className="px-6 py-4">
                      <p className="font-bold text-on-surface line-clamp-1">{borrow.title}</p>
                      <p className="text-xs text-on-surface-variant line-clamp-1">Oleh {borrow.author}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${badgeColors}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${dotColors}`} />
                        {borrow.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-on-surface-variant">
                      {borrow.dueDate}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {isPending && (
                          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Verifikasi QR</span>
                        )}
                        {!isPending && (
                          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-300">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {borrowings.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant">
                    Belum ada riwayat peminjaman sama sekali.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
