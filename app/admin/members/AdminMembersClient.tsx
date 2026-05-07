"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { Pagination } from "@/components/Pagination";
import { MemberActionsDropdown } from "@/components/MemberActionsDropdown";
import type { Member } from "@/lib/types";

interface Props {
  members: Member[];
  total: number;
  page: number;
  totalPages: number;
  search: string;
  role: string;
  dateFrom: string;
  dateTo: string;
  adminRole: "admin" | "librarian";
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export function AdminMembersClient({
  members,
  total,
  page,
  totalPages,
  search,
  role,
  dateFrom,
  dateTo,
  adminRole,
}: Props) {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    const s = fd.get("search") as string;
    const r = fd.get("role") as string;
    const df = fd.get("dateFrom") as string;
    const dt = fd.get("dateTo") as string;
    if (s) params.set("search", s);
    if (r) params.set("role", r);
    if (df) params.set("dateFrom", df);
    if (dt) params.set("dateTo", dt);
    params.set("page", "1");
    router.push(`/admin/members?${params.toString()}`);
  }

  function handleReset() {
    router.push("/admin/members");
  }

  const paginationParams: Record<string, string> = {};
  if (search) paginationParams.search = search;
  if (role) paginationParams.role = role;
  if (dateFrom) paginationParams.dateFrom = dateFrom;
  if (dateTo) paginationParams.dateTo = dateTo;

  const isFiltered = !!(search || role || dateFrom || dateTo);

  return (
    <>
      {/* Filter Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-7 rounded-[2rem] bg-white p-5 shadow-sm"
      >
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
            <input
              className="w-full rounded-2xl border-0 bg-surface-container-high py-4 pl-12 pr-4"
              placeholder="Cari nama, kode anggota..."
              type="search"
              name="search"
              defaultValue={search}
            />
          </div>

          {/* Role */}
          <select
            name="role"
            className="rounded-2xl border-0 bg-surface-container px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20"
            defaultValue={role}
          >
            <option value="">Semua Role</option>
            <option value="student">Siswa</option>
            <option value="teacher">Guru</option>
            {adminRole === "admin" && (
              <>
                <option value="librarian">Pustakawan</option>
                <option value="admin">Admin</option>
              </>
            )}
          </select>

          {/* Date range */}
          <div className="flex items-center gap-2 rounded-2xl bg-surface-container-high px-4 py-2">
            <Icon name="calendar_month" className="shrink-0 text-outline" />
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Dari</span>
                <input
                  type="date"
                  name="dateFrom"
                  defaultValue={dateFrom}
                  className="border-0 bg-transparent text-sm font-semibold focus:ring-0"
                />
              </div>
              <span className="text-outline">—</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Sampai</span>
                <input
                  type="date"
                  name="dateTo"
                  defaultValue={dateTo}
                  className="border-0 bg-transparent text-sm font-semibold focus:ring-0"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary/90"
            >
              <Icon name="search" className="text-[18px]" />
              Cari
            </button>
            {isFiltered && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 rounded-2xl border border-outline/30 bg-white px-4 py-3 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container-high"
              >
                <Icon name="close" className="text-[18px]" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Active filter summary */}
        {isFiltered && (
          <div className="mt-4 flex flex-wrap gap-2">
            {search && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                Nama: &ldquo;{search}&rdquo;
              </span>
            )}
            {role && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                Role: {role === "student" ? "Siswa" : role === "teacher" ? "Guru" : role === "librarian" ? "Pustakawan" : "Admin"}
              </span>
            )}
            {(dateFrom || dateTo) && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                Bergabung: {dateFrom ? formatDate(dateFrom) : "..."} → {dateTo ? formatDate(dateTo) : "sekarang"}
              </span>
            )}
            <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-bold text-on-surface-variant">
              {total} anggota ditemukan
            </span>
          </div>
        )}
      </form>

      {/* Table */}
      <section className="overflow-hidden rounded-[2rem] bg-surface-container-low">
        <div className="hidden grid-cols-[1fr_1fr_120px_170px_80px_80px] gap-4 px-6 py-4 text-xs font-black uppercase tracking-widest text-on-surface-variant md:grid">
          <span>Nama</span>
          <span>Email</span>
          <span>Role</span>
          <span>Bergabung</span>
          <span>Pinjam</span>
          <span>Aksi</span>
        </div>

        {members.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-12 text-center">
            <Icon name="group" className="mb-4 text-6xl text-outline" />
            <h2 className="font-headline text-2xl font-extrabold">Tidak ada anggota</h2>
            <p className="mt-3 text-on-surface-variant">
              {isFiltered
                ? "Tidak ada anggota yang cocok dengan filter yang dipilih."
                : "Tambahkan anggota pertama menggunakan tombol di atas."}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {members.map((member) => (
              <div
                key={member.id}
                className="grid gap-4 bg-white px-6 py-4 transition hover:bg-surface-container-low md:grid-cols-[1fr_1fr_120px_170px_80px_80px] md:items-center"
              >
                <div>
                  <p className="font-bold">{member.name}</p>
                  <p className="flex items-center gap-1 text-sm text-on-surface-variant">
                    {member.displayId}
                    {member.role === "admin" && (
                      <span className="ml-1 rounded bg-primary-container px-1 text-[10px] uppercase text-primary">Admin</span>
                    )}
                    {member.role === "librarian" && (
                      <span className="ml-1 rounded bg-tertiary-container px-1 text-[10px] uppercase text-tertiary">Pustakawan</span>
                    )}
                    {member.role === "teacher" && (
                      <span className="ml-1 rounded bg-amber-100 px-1 text-[10px] uppercase text-amber-700">Guru</span>
                    )}
                  </p>
                </div>

                <p className="truncate text-sm text-on-surface-variant">{member.email}</p>

                <span className="text-sm font-bold">
                  {member.role === "student" ? "Siswa"
                    : member.role === "teacher" ? "Guru"
                    : member.role === "librarian" ? "Pustakawan"
                    : "Admin"}
                </span>

                <span className="text-sm text-on-surface-variant">{member.joinedDate}</span>

                <p className="font-headline text-2xl font-extrabold text-primary">
                  {member.activeBorrowings}
                </p>

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

      <Pagination page={page} totalPages={totalPages} params={paginationParams} />

      <p className="mt-6 text-center text-sm text-on-surface-variant">
        Menampilkan <strong>{members.length}</strong> dari <strong>{total}</strong> anggota
        {totalPages > 1 && (
          <> · Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong></>
        )}
      </p>
    </>
  );
}
