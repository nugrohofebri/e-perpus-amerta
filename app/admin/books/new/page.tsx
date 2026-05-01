import { AppShell } from "@/components/AppShell";
import { AdminBookForm } from "@/components/AdminBookForm";
import { Icon } from "@/components/Icon";
import { requireAdminAccess } from "@/lib/supabase/data";
import { getBookById } from "@/lib/supabase/data";

export default async function AddBookPage({ searchParams }: { searchParams: { edit?: string } }) {
  await requireAdminAccess();

  const editId = searchParams.edit;
  let initialBook = null;

  if (editId) {
    initialBook = await getBookById(editId);
    // Since getBookById resolves everything, we need to adapt it slightly to raw attributes AdminBookForm expects.
    // The previous update expected things like .category, .description, .copies.
    // getBookById returns mapped Book object: { id, title, author, category, copies, description, coverUrl }
    // but the form has naming conventions like `total_copies` for initialData.
    if (initialBook) {
      initialBook = {
        ...initialBook,
        total_copies: initialBook.copies
      };
    }
  }

  return (
    <AppShell mode="admin">
      <section className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.28em] text-primary">Inventory</p>
            <h1 className="font-headline text-4xl font-extrabold tracking-tight">
              {editId ? "Edit Buku" : "Tambah Buku Baru"}
            </h1>
          </div>
          <button className="rounded-full p-3 text-on-surface-variant hover:bg-surface-container">
            <Icon name="more_vert" />
          </button>
        </div>

        <AdminBookForm initialData={initialBook} />
      </section>
    </AppShell>
  );
}
