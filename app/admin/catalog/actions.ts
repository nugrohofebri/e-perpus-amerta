"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteBookAction(bookId: string) {
  const supabase = createClient();

  if (!supabase) {
    return { error: "Supabase belum di-set." };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tidak ada sesi aktif." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: "student" | "librarian" | "admin" | "superadmin" }>();

  if (!profile || !["librarian", "admin", "superadmin"].includes(profile.role)) {
    return { error: "Akses ditolak. Hanya admin/pustakawan yang bisa menghapus." };
  }

  // Optional: Get book first to delete its cover from storage if needed
  const { data: book } = await supabase.from("books").select("cover_url").eq("id", bookId).single();

  const { error } = await supabase.from("books").delete().eq("id", bookId);

  if (error) {
    return { error: error.message };
  }

  // Try to delete image from storage if it exists and originates from our bucket
  if (book?.cover_url && book.cover_url.includes("book-covers")) {
    const urlParts = book.cover_url.split("/");
    const fileName = urlParts[urlParts.length - 1];
    if (fileName) {
      // It's a fire-and-forget deletion, no need to block if it fails
      supabase.storage.from("book-covers").remove([fileName]).catch(() => {});
    }
  }

  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/admin");
  revalidatePath("/admin/catalog");

  return { success: true };
}
