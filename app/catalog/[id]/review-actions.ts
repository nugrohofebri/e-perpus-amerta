"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addReviewAction(bookId: string, rating: number, comment: string) {
  const supabase = createClient();
  if (!supabase) return { error: "Database tidak tersedia." };

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Silakan login terlebih dahulu." };

  const { error } = await supabase
    .from("reviews")
    .upsert(
      { book_id: bookId, member_id: user.id, rating, comment },
      { onConflict: "book_id,member_id" }
    );

  if (error) return { error: error.message };

  revalidatePath(`/catalog/${bookId}`);
  return { success: true };
}

export async function deleteReviewAction(reviewId: string, bookId: string) {
  const supabase = createClient();
  if (!supabase) return { error: "Database tidak tersedia." };

  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

  if (error) return { error: error.message };

  revalidatePath(`/catalog/${bookId}`);
  revalidatePath(`/admin/catalog/${bookId}/reviews`);
  return { success: true };
}
