"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type BookFormState = {
  error?: string;
  success?: string;
};

export async function createBookAction(_: BookFormState, formData: FormData): Promise<BookFormState> {
  const supabase = createClient();

  if (!supabase) {
    return { error: "Supabase belum aktif. Isi .env.local dulu agar buku bisa disimpan." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const isbn = String(formData.get("isbn") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const totalCopies = Number(formData.get("total_copies") ?? 0);
  const coverImage = formData.get("cover_image") as File | null;

  if (!title || !author) {
    return { error: "Judul dan penulis wajib diisi." };
  }

  if (!Number.isFinite(totalCopies) || totalCopies < 0) {
    return { error: "Stok buku tidak valid." };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi login tidak ditemukan. Silakan login ulang." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: "student" | "librarian" | "admin" | "superadmin" }>();

  if (!profile || !["librarian", "admin", "superadmin"].includes(profile.role)) {
    return { error: "Hanya admin atau pustakawan yang boleh menambah buku." };
  }

  let coverUrl: string | null = null;
  if (coverImage && coverImage.size > 0 && coverImage.name !== "undefined") {
    // Buat nama file aman dengan timestamp
    const fileExt = coverImage.name.split('.').pop();
    const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('book-covers')
      .upload(filePath, coverImage);
      
    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage.from('book-covers').getPublicUrl(filePath);
      coverUrl = publicUrlData.publicUrl;
    } else {
      return { error: `Gagal upload cover buku: ${uploadError.message}` };
    }
  }

  const { error } = await supabase.from("books").insert({
    title,
    author,
    isbn: isbn || null,
    category: category || null,
    description: description || null,
    total_copies: totalCopies,
    available_copies: totalCopies,
    status: totalCopies > 0 ? "available" : "archived",
    cover_url: coverUrl
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/admin");
  revalidatePath("/admin/books/new");

  redirect("/admin/catalog");
}

export async function editBookAction(bookId: string, _: BookFormState, formData: FormData): Promise<BookFormState> {
  const supabase = createClient();

  if (!supabase) {
    return { error: "Supabase belum aktif." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const isbn = String(formData.get("isbn") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const totalCopies = Number(formData.get("total_copies") ?? 0);
  const coverImage = formData.get("cover_image") as File | null;

  if (!title || !author) {
    return { error: "Judul dan penulis wajib diisi." };
  }

  if (!Number.isFinite(totalCopies) || totalCopies < 0) {
    return { error: "Stok buku tidak valid." };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi login tidak ditemukan." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single<{ role: string }>();
  if (!profile || !["librarian", "admin", "superadmin"].includes(profile.role)) {
    return { error: "Akses ditolak." };
  }

  let coverUrl = undefined;
  if (coverImage && coverImage.size > 0 && coverImage.name !== "undefined") {
    const fileExt = coverImage.name.split('.').pop();
    const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('book-covers').upload(filePath, coverImage);
    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage.from('book-covers').getPublicUrl(filePath);
      coverUrl = publicUrlData.publicUrl;
    } else {
      return { error: `Gagal upload cover buku: ${uploadError.message}` };
    }
  }

  const updateData: any = {
    title,
    author,
    isbn: isbn || null,
    category: category || null,
    description: description || null,
    total_copies: totalCopies,
    available_copies: totalCopies, // Simple assumption: resetting available copies to total whenever updated for simplicity
    status: totalCopies > 0 ? "available" : "archived"
  };

  if (coverUrl !== undefined) {
    updateData.cover_url = coverUrl;
  }

  const { error } = await supabase.from("books").update(updateData).eq("id", bookId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath(`/catalog/${bookId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/books/new");

  redirect("/admin/catalog");
}
