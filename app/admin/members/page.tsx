import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { StatusChip } from "@/components/StatusChip";
import { AddMemberModal } from "@/components/AddMemberModal";
import { MemberActionsDropdown } from "@/components/MemberActionsDropdown";
import { getMembers, requireAdminAccess } from "@/lib/supabase/data";

export default async function MembersPage() {
  const auth = await requireAdminAccess();
  const members = await getMembers();

  // Tentukan role admin yang sedang login
  const adminRole = (auth.profile?.role ?? "librarian") as "admin" | "librarian";

  // Batasi visibilitas: Librarian HANYA bisa melihat akun "student" (Siswa/Guru)
  const visibleMembers = adminRole === "admin" 
    ? members 
    : members.filter((m) => m.role === "student");

  const activeCount = visibleMembers.filter((m) => m.status === "Aktif").length;
  const blockedCount = visibleMembers.filter((m) => m.status === "Diblokir").length;
  const borrowingCount = visibleMembers.reduce((sum, m) => sum + m.activeBorrowings, 0);

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
            Kelola akun siswa, pustakawan, dan status keanggotaan. Tambah anggota baru lewat tombol di kanan.
          </p>
        </div>
        {/* Client component – butuh adminRole untuk batasi pilihan role */}
        <AddMemberModal adminRole={adminRole} />
      </section>

      {/* Stats strip */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {[
          { icon: "group", label: "Total Anggota", value: visibleMembers.length, highlight: false },
          { icon: "check_circle", label: "Aktif", value: activeCount, highlight: false },
          { icon: "pending_actions", label: "Sedang Pinjam", value: borrowingCount, highlight: true },
        ].map(({ icon, label, value, highlight }) => (
          <div
            key={label}
            className={`flex flex-col gap-1 rounded-2xl p-5 shadow-sm ${highlight ? "bg-primary-container text-on-primary-container" : "bg-white"}`}
          >
            <Icon name={icon} className="text-2xl text-primary" />
            <p className="font-headline text-3xl font-extrabold">{value}</p>
            <p className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</p>
          </div>
        ))}
      </div>

      {/* Search & filter */}
      <div className="mb-7 flex flex-col gap-4 rounded-[2rem] bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
          <input
            className="w-full rounded-2xl border-0 bg-surface-container-high py-4 pl-12 pr-4"
            placeholder="Cari nama, email, atau kode..."
          />
        </div>
        <div className="flex gap-2">
          <select className="rounded-2xl border-0 bg-surface-container px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20">
            <option>Semua Role</option>
            <option value="student">Siswa</option>
            <option value="teacher">Guru</option>
            <option value="librarian">Pustakawan</option>
            <option value="admin">Admin</option>
          </select>
          <select className="rounded-2xl border-0 bg-surface-container px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20">
            <option>Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="diblokir">Diblokir</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <section className="overflow-hidden rounded-[2rem] bg-surface-container-low">
        <div className="hidden grid-cols-[1fr_1fr_120px_120px_100px_80px] gap-4 px-6 py-4 text-xs font-black uppercase tracking-widest text-on-surface-variant md:grid">
          <span>Nama</span>
          <span>Email</span>
          <span>Role</span>
          <span>Bergabung</span>
          <span>Pinjam</span>
          <span>Aksi</span>
        </div>

        {visibleMembers.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-12 text-center">
            <Icon name="group" className="mb-4 text-6xl text-outline" />
            <h2 className="font-headline text-2xl font-extrabold">Belum ada anggota</h2>
            <p className="mt-3 text-on-surface-variant">
              Tambahkan anggota pertama menggunakan tombol &ldquo;Tambah Anggota&rdquo; di atas.
            </p>
          </div>
        ) : (
          <div className="space-y-0.5 pb-36">
            {visibleMembers.map((member) => (
              <div
                key={member.id}
                className="grid gap-4 bg-white px-6 py-4 transition hover:bg-surface-container-low md:grid-cols-[1fr_1fr_120px_120px_100px_80px] md:items-center"
              >
                {/* Nama + ID */}
                <div>
                  <p className="font-bold">{member.name}</p>
                  <p className="text-sm text-on-surface-variant flex items-center gap-1">
                    {member.displayId}
                    {member.role === "admin" && <span className="ml-1 rounded bg-primary-container px-1 text-[10px] uppercase text-primary">Admin</span>}
                    {member.role === "librarian" && <span className="ml-1 rounded bg-tertiary-container px-1 text-[10px] uppercase text-tertiary">Pustakawan</span>}
                    {member.role === "teacher" && <span className="ml-1 rounded bg-amber-100 px-1 text-[10px] uppercase text-amber-700">Guru</span>}
                  </p>
                </div>

                {/* Email */}
                <p className="text-sm text-on-surface-variant">{member.email}</p>

                {/* Role */}
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold">
                    {member.role === "student" ? "Siswa" : 
                     member.role === "teacher" ? "Guru" : 
                     member.role === "librarian" ? "Pustakawan" : "Admin"}
                  </span>
                </div>

                {/* Bergabung (Tanggal) */}
                <span className="text-sm text-on-surface-variant">
                  {member.joinedDate}
                </span>

                {/* Active borrowings */}
                <p className="font-headline text-2xl font-extrabold text-primary">
                  {member.activeBorrowings}
                </p>

                {/* Actions */}
                <MemberActionsDropdown 
                  memberId={member.id} 
                  memberName={member.name} 
                  currentRole={member.role} 
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer count */}
      <p className="mt-6 text-center text-sm text-on-surface-variant">
        Menampilkan <strong>{visibleMembers.length}</strong> anggota ·{" "}
        <strong>{activeCount}</strong> aktif ·{" "}
        <strong>{blockedCount}</strong> diblokir
      </p>
    </AppShell>
  );
}
