import { AppShell } from "@/components/AppShell";
import { getBooksPaginated, getSavedBooks, requireStudentAccess } from "@/lib/supabase/data";
import { CatalogClient } from "./CatalogClient";

const LIMIT = 12;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const auth = await requireStudentAccess();
  const isLoggedIn = !!auth.user;

  const page = Number(searchParams.page ?? 1);
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const category = typeof searchParams.category === "string" ? searchParams.category : "";

  const [{ books, total }, savedBooks] = await Promise.all([
    getBooksPaginated({ page, limit: LIMIT, search, category }),
    getSavedBooks(),
  ]);

  const totalPages = Math.ceil(total / LIMIT);
  const savedBookIds = savedBooks.map((b) => b.id);

  return (
    <AppShell>
      <CatalogClient
        books={books}
        savedBookIds={savedBookIds}
        isLoggedIn={isLoggedIn}
        page={page}
        totalPages={totalPages}
        total={total}
        search={search}
        category={category}
      />
    </AppShell>
  );
}
