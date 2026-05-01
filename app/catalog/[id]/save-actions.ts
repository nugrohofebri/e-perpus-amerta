"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleSaveBookAction(bookId: string) {
  const supabase = createClient();
  if (!supabase) return { error: "Database tidak tersedia." };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Harap masuk untuk menyimpan buku." };

  // Cek apakah buku sudah disave
  const { data: existing } = await supabase
    .from("saved_books")
    .select("id")
    .eq("book_id", bookId)
    .eq("member_id", user.id)
    .single();

  if (existing) {
    // Un-save
    const { error } = await supabase
      .from("saved_books")
      .delete()
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    // Save
    const { error } = await supabase
      .from("saved_books")
      .insert({ book_id: bookId, member_id: user.id });
    if (error) return { error: error.message };
  }

  revalidatePath(`/catalog/${bookId}`);
  revalidatePath(`/saved`);
  revalidatePath(`/`);
  
  return { success: true };
}
