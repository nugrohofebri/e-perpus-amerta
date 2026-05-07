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
  total_copies: number;
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
  borrowed_at: string | null;
  returned_at: string | null;
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
    totalCopies: book.total_copies ?? book.available_copies,
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
    dueDate: dueAt ? dueAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-",
    borrowDate: borrowing.borrowed_at 
      ? new Date(borrowing.borrowed_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) 
      : new Date(borrowing.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
    returnDate: borrowing.returned_at ? new Date(borrowing.returned_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-",

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

export async function requireStudentAccess() {
  const auth = await getCurrentProfile();

  if (auth.isDemo) {
    return auth;
  }

  // If user is not logged in, we let them proceed since some public pages allow guests.
  // Wait, if it's requireStudentAccess, maybe they need to be logged in? 
  // Guest can see homepage and catalog, so we don't force login for everyone.
  // But if they are logged in AND are staff, we kick them to /admin.
  if (auth.profile) {
    if (["admin", "librarian", "superadmin"].includes(auth.profile.role)) {
      redirect("/admin");
    }
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
    .select("id, title, author, category, total_copies, available_copies, description, status, cover_url, created_at")
    .order("created_at", { ascending: false })
    .returns<DbBook[]>();

  if (error || !data?.length) {
    return demoBooks;
  }

  return data.map(mapBook);
}

export async function getBooksPaginated(options: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  minCopies?: number;
  maxCopies?: number;
}): Promise<{ books: Book[]; total: number }> {
  const supabase = createClient();
  const page = Math.max(1, options.page ?? 1);
  const limit = options.limit ?? 12;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  if (!supabase) {
    let filtered = demoBooks;
    if (options.search) {
      const s = options.search.toLowerCase();
      filtered = filtered.filter(
        (b) => b.title.toLowerCase().includes(s) || b.author.toLowerCase().includes(s)
      );
    }
    if (options.category) filtered = filtered.filter((b) => b.category === options.category);
    return { books: filtered.slice(from, from + limit), total: filtered.length };
  }

  let query = supabase
    .from("books")
    .select("id, title, author, category, total_copies, available_copies, description, status, cover_url, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (options.search?.trim()) {
    query = query.or(
      `title.ilike.%${options.search.trim()}%,author.ilike.%${options.search.trim()}%`
    );
  }
  if (options.category?.trim()) {
    query = query.eq("category", options.category.trim());
  }
  if (options.status?.trim()) {
    query = query.eq("status", options.status.trim());
  }
  if (options.minCopies !== undefined) {
    query = query.gte("total_copies", options.minCopies);
  }
  if (options.maxCopies !== undefined) {
    query = query.lte("total_copies", options.maxCopies);
  }

  const { data, error, count } = await query;

  if (error || !data) {
    return { books: demoBooks.slice(from, from + limit), total: demoBooks.length };
  }

  return { books: (data as DbBook[]).map(mapBook), total: count ?? 0 };
}

export async function getBookStats(): Promise<{
  total: number;
  available: number;
  borrowed: number;
  totalCopies: number;
}> {
  const supabase = createClient();

  if (!supabase) {
    return {
      total: demoBooks.length,
      available: demoBooks.filter((b) => b.status === "available").length,
      borrowed: demoBooks.filter((b) => b.status === "borrowed").length,
      totalCopies: demoBooks.reduce((s, b) => s + b.copies, 0),
    };
  }

  const { data, error } = await supabase
    .from("books")
    .select("status, total_copies");

  if (error || !data) return { total: 0, available: 0, borrowed: 0, totalCopies: 0 };

  const rows = data as { status: string; total_copies: number }[];
  return {
    total: rows.length,
    available: rows.filter((b) => b.status === "available").length,
    borrowed: rows.filter((b) => b.status === "borrowed").length,
    totalCopies: rows.reduce((s, b) => s + (b.total_copies ?? 0), 0),
  };
}

export async function getBookById(id: string) {
  const supabase = createClient();

  if (!supabase) {
    return demoBooks.find((book) => book.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("books")
    .select("id, title, author, category, total_copies, available_copies, description, status, cover_url, created_at")
    .eq("id", id)
    .single<DbBook>();

  if (error || !data) {
    return demoBooks.find((book) => book.id === id) ?? null;
  }

  return mapBook(data);
}

export async function getBorrowings(options?: { all?: boolean }) {
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
    .select("id, status, due_at, returned_at, created_at, book:books(title, author, cover_url), member:profiles(full_name)")
    .order("created_at", { ascending: false });

  const isAdmin = auth.profile?.role === "admin" || auth.profile?.role === "librarian" || auth.profile?.role === "superadmin";

  const scopedQuery = isAdmin && options?.all
    ? query.limit(500)
    : query.eq("member_id", auth.user.id);

  const { data, error } = await scopedQuery.returns<DbBorrowing[]>();

  if (error) {
    console.error("GET BORROWINGS ERROR:", error);
  }

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

export async function getMembersPaginated(options: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  dateFrom?: string;  // format YYYY-MM-DD
  dateTo?: string;   // format YYYY-MM-DD
  adminRole?: "admin" | "librarian";
}): Promise<{ members: Member[]; total: number }> {
  const supabase = createClient();
  const page = Math.max(1, options.page ?? 1);
  const limit = options.limit ?? 15;
  const startIdx = (page - 1) * limit;
  const endIdx = startIdx + limit - 1;

  if (!supabase) {
    return { members: demoMembers.slice(startIdx, startIdx + limit), total: demoMembers.length };
  }

  let query = supabase
    .from("profiles")
    .select("id, full_name, role, member_code, grade, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(startIdx, endIdx);

  // Librarian hanya boleh lihat siswa & guru
  if (options.adminRole === "librarian") {
    if (options.role && ["student", "teacher"].includes(options.role)) {
      query = query.eq("role", options.role);
    } else {
      query = query.in("role", ["student", "teacher"]);
    }
  } else if (options.role) {
    query = query.eq("role", options.role);
  }

  if (options.search?.trim()) {
    query = query.or(
      `full_name.ilike.%${options.search.trim()}%,member_code.ilike.%${options.search.trim()}%`
    );
  }

  // Filter rentang tanggal bergabung
  if (options.dateFrom) {
    query = query.gte("created_at", options.dateFrom);
  }
  if (options.dateTo) {
    // Tambah T23:59:59 agar hari terakhir ikut masuk
    query = query.lte("created_at", `${options.dateTo}T23:59:59`);
  }

  const { data, error, count } = await query;
  if (error || !data) return { members: [], total: 0 };

  const memberIds = (data as DbProfile[]).map((p) => p.id);

  const [borrowingData, emailData] = await Promise.all([
    supabase
      .from("borrowings")
      .select("member_id, status")
      .in("member_id", memberIds)
      .in("status", ["borrowed", "overdue"]),
    supabase.rpc("get_member_emails"),
  ]);

  const borrowCount = new Map<string, number>();
  borrowingData.data?.forEach((item: any) => {
    borrowCount.set(item.member_id, (borrowCount.get(item.member_id) ?? 0) + 1);
  });

  const emailMap = new Map<string, string>();
  emailData.data?.forEach((row: any) => {
    emailMap.set(row.id, row.email);
  });

  const members = (data as DbProfile[]).map((profile) => ({
    id: profile.id,
    displayId: profile.member_code ?? profile.id.slice(0, 8).toUpperCase(),
    name: profile.full_name,
    joinedDate: profile.created_at
      ? new Date(profile.created_at).toLocaleDateString("id-ID", {
          day: "numeric", month: "long", year: "numeric",
        })
      : "-",
    email: emailMap.get(profile.id) ?? "-",
    role: profile.role,
    status: "Aktif" as const,
    activeBorrowings: borrowCount.get(profile.id) ?? 0,
  })) as Member[];

  return { members, total: count ?? 0 };
}

export async function getMemberStats(
  adminRole: "admin" | "librarian"
): Promise<{ total: number; borrowing: number }> {
  const supabase = createClient();
  if (!supabase) {
    return { total: demoMembers.length, borrowing: 0 };
  }

  let profileQuery = supabase
    .from("profiles")
    .select("id", { count: "exact" });
  if (adminRole === "librarian") {
    profileQuery = profileQuery.in("role", ["student", "teacher"]);
  }
  const { data: profiles, count } = await profileQuery;

  const memberIds = (profiles as any[])?.map((p) => p.id) ?? [];
  const { data: borrows } = await supabase
    .from("borrowings")
    .select("member_id")
    .in("member_id", memberIds)
    .in("status", ["borrowed", "overdue"]);

  const activeBorrowers = new Set((borrows as any[])?.map((b) => b.member_id) ?? []);

  return { total: count ?? 0, borrowing: activeBorrowers.size };
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
