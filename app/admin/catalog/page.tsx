import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { getBooks, requireAdminAccess } from "@/lib/supabase/data";
import { AdminCatalogClient } from "./AdminCatalogClient";

export default async function AdminCatalogPage() {
  await requireAdminAccess();
  const books = await getBooks();

  const available = books.filter((b) => b.status === "available").length;
  const borrowed = books.filter((b) => b.status === "borrowed").length;
  const totalCopies = books.reduce((sum, b) => sum + b.copies, 0);

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

      {/* Stats strip */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {[
          { icon: "auto_stories", label: "Total Judul", value: books.length },
          { icon: "check_circle", label: "Tersedia", value: available },
          { icon: "inventory_2", label: "Total Eksemplar", value: totalCopies },
        ].map(({ icon, label, value }) => (
          <div
            key={label}
            className="flex flex-col gap-1 rounded-2xl bg-white p-5 shadow-sm"
          >
            <Icon name={icon} className="text-2xl text-primary" />
            <p className="font-headline text-3xl font-extrabold">{value}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              {label}
            </p>
          </div>
        ))}
      </div>

      <AdminCatalogClient books={books} totalCopies={totalCopies} borrowed={borrowed} />
    </AppShell>
  );
}
