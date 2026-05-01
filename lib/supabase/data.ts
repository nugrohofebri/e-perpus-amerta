import { redirect } from "next/navigation";
import { books as demoBooks, borrowings as demoBorrowings, members as demoMembers } from "@/lib/demo-data";
import type { Book, Borrowing, Member, Profile, Review, UserRole } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

type DbProfile = {
  id: string;
  full_name: string;
  role: UserRole;
  member_code: string | null;
  grade: string | null;
  created_at?: string;
};

type DbBook = {
  id: string;
  title: string;
  author: string;
  category: string | null;
  grade_level: string | null;
  available_copies: number;
  description: string | null;
  status: "available" | "borrowed" | "archived";
  cover_url?: string | null;
  created_at?: string;
};

type DbBorrowing = {
  id: string;
  status: "pending" | "approved" | "borrowed" | "returned" | "rejected" | "overdue";
  due_at: string | null;
  created_at: string;
  book: {
    title: string;
    author: string;
    cover_url?: string | null;
  } | null;
  member: {
    full_name: string;
  } | null;
};

function mapProfile(profile: DbProfile, email: string): Profile {
  return {
    id: profile.id,
    fullName: profile.full_name,
    email,
    role: profile.role,
    memberCode: profile.member_code ?? `MBR-${profile.id.slice(0, 8).toUpperCase()}`,
    grade: profile.grade ?? "-"
  };
}

function mapBook(book: DbBook): Book {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    category: book.category ?? "Umum",
    grade: "Umum",
    copies: book.available_copies,
    status: book.available_copies > 0 && book.status === "available" ? "available" : book.status === "borrowed" ? "borrowed" : "pending",
    description: book.description ?? "Belum ada deskripsi buku.",
    coverTone: book.id.charCodeAt(0) % 2 === 0 ? "blue" : "warm",
    coverUrl: book.cover_url,
    createdAt: book.created_at ? new Date(book.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : undefined
  };
}

function mapBorrowing(borrowing: DbBorrowing): Borrowing {
  const statusMap: Record<DbBorrowing["status"], Borrowing["status"]> = {
    pending: "Menunggu",
    approved: "Menunggu",
    borrowed: "Aktif",
    returned: "Dikembalikan",
    rejected: "Dikembalikan",
    overdue: "Terlambat"
  };

  let finalStatus = statusMap[borrowing.status];
  const dueAt = borrowing.due_at ? new Date(borrowing.due_at) : null;
  const now = new Date();
  
  let daysRemaining: number | undefined;

  if (dueAt) {
    // Menghitung selisih hari (bisa minus kalau lewat)
    const diffTime = dueAt.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  if (borrowing.status === "borrowed" && dueAt && dueAt < now) {
    finalStatus = "Terlambat";
  }

  return {
    id: borrowing.id,
    title: borrowing.book?.title ?? "Buku tidak ditemukan",
    author: borrowing.book?.author ?? "-",
    status: finalStatus,
    dueDate: dueAt ? dueAt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Belum ada tanggal",
    createdAt: borrowing.created_at,
    coverUrl: borrowing.book?.cover_url,
    borrowerName: borrowing.member?.full_name,
    daysRemaining
  };
}

export function isSupabaseConfigured() {
  const { url, clientKey } = getSupabaseEnv();
  return Boolean(url && clientKey);
}

export async function getCurrentProfile() {
  const supabase = createClient();

  if (!supabase) {
    return {
      user: null,
      profile: null as Profile | null,
      isDemo: true
    };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      user: null,
      profile: null as Profile | null,
      isDemo: false
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, member_code, grade")
    .eq("id", user.id)
    .single<DbProfile>();

  return {
    user,
    profile: profile ? mapProfile(profile, user.email) : null,
    isDemo: false
  };
}

export async function requireAuthenticatedUser() {
  const auth = await getCurrentProfile();

  if (auth.isDemo) {
    return auth;
  }

  if (!auth.user) {
    redirect("/login");
  }

  return auth;
}

export async function requireAdminAccess() {
  const auth = await requireAuthenticatedUser();

  if (auth.isDemo) {
    return auth;
  }

  if (!auth.profile) {
    redirect("/login");
  }

  if (!["admin", "librarian", "superadmin"].includes(auth.profile.role)) {
    redirect("/");
  }

  return auth;
}

export async function getBooks() {
  const supabase = createClient();

  if (!supabase) {
    return demoBooks;
  }

  const { data, error } = await supabase
    .from("books")
    .select("id, title, author, category, available_copies, description, status, cover_url, created_at")
    .order("created_at", { ascending: false })
    .returns<DbBook[]>();

  if (error || !data?.length) {
    return demoBooks;
  }

  return data.map(mapBook);
}

export async function getBookById(id: string) {
  const supabase = createClient();

  if (!supabase) {
    return demoBooks.find((book) => book.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("books")
    .select("id, title, author, category, available_copies, description, status, cover_url, created_at")
    .eq("id", id)
    .single<DbBook>();

  if (error || !data) {
    return demoBooks.find((book) => book.id === id) ?? null;
  }

  return mapBook(data);
}

export async function getBorrowings() {
  const supabase = createClient();

  if (!supabase) {
    return demoBorrowings;
  }

  const auth = await getCurrentProfile();

  if (!auth.user) {
    return [];
  }

  const query = supabase
    .from("borrowings")
    .select("id, status, due_at, created_at, book:books(title, author, cover_url), member:profiles(full_name)")
    .order("created_at", { ascending: false });

  const scopedQuery =
    auth.profile?.role === "admin" || auth.profile?.role === "librarian" || auth.profile?.role === "superadmin"
      ? query.limit(20)
      : query.eq("member_id", auth.user.id);

  const { data, error } = await scopedQuery.returns<DbBorrowing[]>();

  if (error || !data) {
    return demoBorrowings;
  }

  return data.map(mapBorrowing);
}

export async function getMembers() {
  const supabase = createClient();

  if (!supabase) {
    return demoMembers;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, member_code, created_at")
    .order("created_at", { ascending: false })
    .returns<DbProfile[]>();

  if (error || !data) {
    return demoMembers;
  }

  const memberIds = data.map((profile) => profile.id);

  const { data: borrowingRows } = await supabase
    .from("borrowings")
    .select("member_id, status")
    .in("member_id", memberIds);

  const borrowCount = new Map<string, number>();

  borrowingRows?.forEach((item) => {
    if (item.status === "borrowed" || item.status === "overdue") {
      borrowCount.set(item.member_id, (borrowCount.get(item.member_id) ?? 0) + 1);
    }
  });

  // Call secure RPC to retrieve emails from auth.users (requires SQL execution by user)
  const { data: emailRows } = await supabase.rpc("get_member_emails");
  const emailMap = new Map<string, string>();
  emailRows?.forEach((row: any) => {
    emailMap.set(row.id, row.email);
  });

  return data.map((profile) => ({
    id: profile.id,
    displayId: profile.member_code ?? profile.id.slice(0, 8).toUpperCase(),
    name: profile.full_name,
    joinedDate: profile.created_at ? new Date(profile.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-",
    email: emailMap.get(profile.id) ?? "-",
    role: profile.role,
    status: profile.role === "student" ? "Aktif" : "Aktif",
    activeBorrowings: borrowCount.get(profile.id) ?? 0
  })) as Member[];
}

export async function hasUserBorrowedBook(bookId: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("borrowings")
    .select("id")
    .eq("book_id", bookId)
    .eq("member_id", user.id)
    .in("status", ["returned", "borrowed", "overdue"]) // pernah/sedang meminjam
    .limit(1);

  return !error && Array.isArray(data) && data.length > 0;
}

export async function getReviews(bookId: string): Promise<Review[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select("id, book_id, member_id, rating, comment, created_at, author:profiles(full_name)")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((r: any) => ({
    id: r.id,
    bookId: r.book_id,
    authorId: r.member_id,
    authorName: r.author?.full_name ?? "Anonim",
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at
  }));
}

export async function isBookSaved(bookId: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("saved_books")
    .select("id")
    .eq("book_id", bookId)
    .eq("member_id", user.id)
    .limit(1);

  return !error && Array.isArray(data) && data.length > 0;
}

export async function getSavedBooks(): Promise<Book[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("saved_books")
    .select("book:books(id, title, author, category, available_copies, description, status, cover_url, created_at)")
    .eq("member_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data
    .map((item: any) => item.book)
    .filter((b: any): b is DbBook => b !== null)
    .map(mapBook);
}
