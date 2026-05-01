"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveBorrowingAction(borrowingId: string) {
  const supabase = createClient();
  
  if (!supabase) {
    return { success: false, error: "Konfigurasi database belum tersedia." };
  }

  // Verifikasi otorisasi admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Autentikasi gagal. Sesi admin daluwarsa." };

  // Mengecek baris peminjaman
  const { data: borrowing, error: readError } = await supabase
    .from("borrowings")
    .select("created_at, status, book_id, book:books(title)")
    .eq("id", borrowingId)
    .single();

  if (readError || !borrowing) {
    return { success: false, error: "QR code tidak valid atau data peminjaman tidak ditemukan." };
  }

  if (borrowing.status !== "pending") {
    return { success: false, error: "Tidak dapat diproses. Transaksi ini mungkin sudah disetujui sebelumnya." };
  }

  // Validasi Limit 5 Menit
  const createdAt = new Date(borrowing.created_at);
  const now = new Date();
  const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

  if (diffMinutes > 5) {
    return { success: false, error: "QR Code telah kadaluarsa (Melewati batas 5 Menit). Harap minta siswa membuat QR baru." };
  }

  // Update Status menjadi "borrowed" (Aktif)
  const { error: updateError } = await supabase
    .from("borrowings")
    .update({ status: "borrowed" })
    .eq("id", borrowingId);

  if (updateError) {
    return { success: false, error: "Terjadi kesalahan internal saat memperbarui status peminjaman." };
  }

  // Revalidasi jalur agar dashboard terbaru
  revalidatePath("/admin/borrowings");
  revalidatePath("/admin/scan");
  revalidatePath("/admin/books");
  revalidatePath("/catalog");
  revalidatePath("/");
  revalidatePath("/borrowings");
  if (borrowing.book_id) {
    revalidatePath(`/catalog/${borrowing.book_id}`);
  }
  
  return { 
    success: true, 
    // Mengembalikan nama buku untuk ditampilkan dalam toast sukses di AdminScanner
    message: `Peminjaman Buku berhasil disetujui!` 
  };
}

export async function returnBorrowingAction(borrowingId: string) {
  const supabase = createClient();
  if (!supabase) return { success: false, error: "Database tidak terkonfigurasi." };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Sesi admin tidak valid." };

  const { data: borrowing, error: readError } = await supabase
    .from("borrowings")
    .select("status, book_id, book:books(title)")
    .eq("id", borrowingId)
    .single();

  if (readError || !borrowing) {
    return { success: false, error: "Data peminjaman tidak ditemukan." };
  }

  if (borrowing.status !== "borrowed") {
    return { success: false, error: "Status buku ini bukan 'Sedang Dipinjam'." };
  }

  // Update status ke dikembalikan dan catat waktunya
  const { error: updateError } = await supabase
    .from("borrowings")
    .update({ status: "returned", returned_at: new Date().toISOString() })
    .eq("id", borrowingId);

  if (updateError) {
    return { success: false, error: "Gagal memproses pengembalian buku." };
  }

  // Kembalikan stok buku via RPC (bypass RLS)
  if (borrowing.book_id) {
    await supabase.rpc("increment_book_stock", { p_book_id: borrowing.book_id });
  }

  revalidatePath("/admin/borrowings");
  revalidatePath("/admin/scan");
  revalidatePath("/admin/books");
  revalidatePath("/catalog");
  revalidatePath("/");
  revalidatePath("/borrowings");
  if (borrowing.book_id) {
    revalidatePath(`/catalog/${borrowing.book_id}`);
  }
  
  return { 
    success: true, 
    message: `Buku "${Array.isArray(borrowing.book) ? borrowing.book[0]?.title : (borrowing.book as any)?.title}" telah sukses dikembalikan ke perpustakaan.` 
  };
}
