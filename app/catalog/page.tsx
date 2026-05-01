import { AppShell } from "@/components/AppShell";
import { getBooks, getSavedBooks, getCurrentProfile } from "@/lib/supabase/data";
import { CatalogClient } from "./CatalogClient";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const books = await getBooks();
  const savedBooks = await getSavedBooks();
  const auth = await getCurrentProfile();
  const savedBookIds = savedBooks.map((b) => b.id);
  const initCategory = typeof searchParams.category === "string" ? searchParams.category : "";
  const isLoggedIn = !!auth.user;

  return (
    <AppShell>
      <CatalogClient 
        books={books} 
        savedBookIds={savedBookIds} 
        initialCategory={initCategory} 
        isLoggedIn={isLoggedIn} 
      />
    </AppShell>
  );
}
