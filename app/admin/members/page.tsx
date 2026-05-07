import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { AddMemberModal } from "@/components/AddMemberModal";
import {
  getMembersPaginated,
  getMemberStats,
  requireAdminAccess,
} from "@/lib/supabase/data";
import { AdminMembersClient } from "./AdminMembersClient";

const LIMIT = 15;

export default async function MembersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const auth = await requireAdminAccess();
  const adminRole = (auth.profile?.role ?? "librarian") as "admin" | "librarian";

  const page = Number(searchParams.page ?? 1);
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const role = typeof searchParams.role === "string" ? searchParams.role : "";
  const dateFrom = typeof searchParams.dateFrom === "string" ? searchParams.dateFrom : "";
  const dateTo = typeof searchParams.dateTo === "string" ? searchParams.dateTo : "";

  const [{ members, total }, stats] = await Promise.all([
    getMembersPaginated({ page, limit: LIMIT, search, role, dateFrom, dateTo, adminRole }),
    getMemberStats(adminRole),
  ]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <AppShell mode="admin">
      {/* Header */}
      <section className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.28em] text-primary">
            Management
          </p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight md:text-5xl">
            Anggota Perpustakaan
          </h1>
          <p className="mt-3 max-w-xl text-on-surface-variant">
            Kelola akun siswa, guru, dan pustakawan. Gunakan filter untuk melihat anggota berdasarkan role atau waktu bergabung.
          </p>
        </div>
        <AddMemberModal adminRole={adminRole} />
      </section>

      {/* Stats strip */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {[
          { icon: "group", label: "Total Anggota", value: stats.total, highlight: false },
          { icon: "check_circle", label: "Aktif", value: stats.total, highlight: false },
          { icon: "pending_actions", label: "Sedang Pinjam", value: stats.borrowing, highlight: true },
        ].map(({ icon, label, value, highlight }) => (
          <div
            key={label}
            className={`flex flex-col gap-1 rounded-2xl p-5 shadow-sm ${
              highlight ? "bg-primary-container text-on-primary-container" : "bg-white"
            }`}
          >
            <Icon name={icon} className="text-2xl text-primary" />
            <p className="font-headline text-3xl font-extrabold">{value}</p>
            <p className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</p>
          </div>
        ))}
      </div>

      <AdminMembersClient
        members={members}
        total={total}
        page={page}
        totalPages={totalPages}
        search={search}
        role={role}
        dateFrom={dateFrom}
        dateTo={dateTo}
        adminRole={adminRole}
      />
    </AppShell>
  );
}
