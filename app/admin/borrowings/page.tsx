import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { getBorrowings, requireAdminAccess } from "@/lib/supabase/data";
import { AdminBorrowingsClient } from "./AdminBorrowingsClient";

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

      <AdminBorrowingsClient initialBorrowings={borrowings} />
    </AppShell>
  );
}
