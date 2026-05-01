"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createBorrowingAction(bookId: string) {
  const supabase = createClient();

  if (!supabase) {
    return { success: false, error: "Konfigurasi database tidak dikonfigurasi dengan benar." };
  }

  // Memastikan pengguna sudah login
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Tolong login ulang untuk meminjam buku." };
  }

  // Cek ketersediaan buku
  const { data: book, error: bookError } = await supabase
    .from("books")
    .select("available_copies, status")
    .eq("id", bookId)
    .single();

  if (bookError || !book) {
    return { success: false, error: "Buku tidak ditemukan." };
  }

  if (book.available_copies <= 0 || book.status !== "available") {
    return { success: false, error: "Buku sudah tidak tersedia (habis dipinjam)." };
  }

  // Set tanggal pengembalian (Masa peminjaman 14 hari)
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + 14);

  // Insert ke database
  const { data: insertedData, error: insertError } = await supabase
    .from("borrowings")
    .insert([
      {
        book_id: bookId,
        member_id: user.id,
        status: "pending",
        due_at: dueAt.toISOString(),
      }
    ])
    .select("id")
    .single();

  if (insertError || !insertedData) {
    console.error("Gagal meminjam buku:", insertError);
    return { success: false, error: "Gagal memproses peminjaman. Silakan coba lagi." };
  }

  // Kurangi stok buku via RPC (SECURITY DEFINER - bypass RLS)
  const { data: stockResult, error: rpcError } = await supabase
    .rpc("decrement_book_stock", { p_book_id: bookId as string });

  if (rpcError) {
    // RPC gagal (function tidak ada atau error DB) - rollback peminjaman
    console.error("❌ RPC decrement_book_stock error:", JSON.stringify(rpcError));
    await supabase.from("borrowings").delete().eq("id", insertedData.id);
    return { success: false, error: `Gagal memproses stok buku: ${rpcError.message}` };
  }

  // Cek hasil dari fungsi RPC (JSONB)
  const result = stockResult as { success: boolean; error?: string } | null;
  if (result && result.success === false) {
    await supabase.from("borrowings").delete().eq("id", insertedData.id);
    return { success: false, error: result.error || "Stok buku habis." };
  }

  // Refresh cache halaman
  revalidatePath(`/catalog/${bookId}`);
  revalidatePath("/borrowings");
  revalidatePath("/catalog");
  revalidatePath("/");
  revalidatePath("/admin/books");

  return { success: true, borrowingId: insertedData.id };
}

export async function deleteExpiredBorrowingAction(borrowingId: string) {
  const supabase = createClient();
  if (!supabase) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Dapatkan book_id terlebih dahulu
  const { data: borrowing } = await supabase
    .from("borrowings")
    .select("id, book_id")
    .eq("id", borrowingId)
    .eq("member_id", user.id)
    .eq("status", "pending")
    .single();

  if (!borrowing) return; // Tidak ditemukan atau bukan milik dia / bukan pending

  // Hanya hapus jika masih berstatus "pending" (belum di-scan petugas)
  const { error: deleteError } = await supabase
    .from("borrowings")
    .delete()
    .eq("id", borrowingId);

  if (!deleteError && borrowing.book_id) {
    // Kembalikan stok buku via RPC (bypass RLS)
    await supabase.rpc("increment_book_stock", { p_book_id: borrowing.book_id });
  }

  revalidatePath("/borrowings");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/admin/books");
  if (borrowing.book_id) {
    revalidatePath(`/catalog/${borrowing.book_id}`);
  }
}
