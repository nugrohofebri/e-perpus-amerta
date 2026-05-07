import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { getBooksPaginated, getBookStats, requireAdminAccess } from "@/lib/supabase/data";
import { AdminCatalogClient } from "./AdminCatalogClient";

const LIMIT = 20;

export default async function AdminCatalogPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  await requireAdminAccess();

  const page = Number(searchParams.page ?? 1);
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const category = typeof searchParams.category === "string" ? searchParams.category : "";
  const status = typeof searchParams.status === "string" ? searchParams.status : "";
  const copies = typeof searchParams.copies === "string" ? searchParams.copies : "";

  // Map copies filter ke range
  let minCopies: number | undefined;
  let maxCopies: number | undefined;
  if (copies === "0") { minCopies = 0; maxCopies = 0; }
  else if (copies === "1") { minCopies = 1; maxCopies = 1; }
  else if (copies === "2") { minCopies = 2; maxCopies = 2; }
  else if (copies === "3") { minCopies = 3; maxCopies = 3; }
  else if (copies === "4") { minCopies = 4; maxCopies = 4; }
  else if (copies === "5") { minCopies = 5; maxCopies = 5; }
  else if (copies === "5plus") { minCopies = 6; }

  const [{ books, total }, stats] = await Promise.all([
    getBooksPaginated({ page, limit: LIMIT, search, category, status, minCopies, maxCopies }),
    getBookStats(),
  ]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <AppShell mode="admin">
      {/* Header */}
      <section className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.28em] text-primary">
            Inventory
          </p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight md:text-5xl">
            Katalog Buku
          </h1>
          <p className="mt-3 max-w-xl text-on-surface-variant">
            Kelola seluruh koleksi buku perpustakaan — tambah, edit, dan pantau ketersediaan stok.
          </p>
        </div>
        <Link
          href="/admin/books/new"
          className="flex w-fit items-center gap-2 rounded-full bg-gradient-to-br from-primary to-primary-container px-7 py-4 font-bold text-white shadow-soft transition hover:scale-105 active:scale-95"
        >
          <Icon name="add" />
          Tambah Buku Baru
        </Link>
      </section>

      {/* Stats strip — selalu ambil dari stats keseluruhan */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {[
          { icon: "auto_stories", label: "Total Judul", value: stats.total },
          { icon: "check_circle", label: "Tersedia", value: stats.available },
          { icon: "inventory_2", label: "Total Eksemplar", value: stats.totalCopies },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex flex-col gap-1 rounded-2xl bg-white p-5 shadow-sm">
            <Icon name={icon} className="text-2xl text-primary" />
            <p className="font-headline text-3xl font-extrabold">{value}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              {label}
            </p>
          </div>
        ))}
      </div>

      <AdminCatalogClient
        books={books}
        total={total}
        page={page}
        totalPages={totalPages}
        search={search}
        category={category}
        statusFilter={status}
        copiesFilter={copies}
        borrowed={stats.borrowed}
        totalCopies={stats.totalCopies}
      />
    </AppShell>
  );
}
