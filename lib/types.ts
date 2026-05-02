export type BookStatus = "available" | "borrowed" | "pending";

export type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  grade: string;
  copies: number;
  status: BookStatus;
  description: string;
  coverTone: "blue" | "warm";
  coverUrl?: string | null;
  createdAt?: string;
};

export type Review = {
  id: string;
  bookId: string;
  authorId: string;
  authorName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export type Borrowing = {
  id: string;
  title: string;
  author: string;
  status: "Aktif" | "Menunggu" | "Dikembalikan" | "Terlambat";
  dueDate: string;
  borrowDate?: string;
  returnDate?: string;
  createdAt?: string;
  coverUrl?: string | null;
  borrowerName?: string;
  daysRemaining?: number;
};

export type Member = {
  id: string;
  displayId: string;
  name: string;
  email: string;
  joinedDate: string;
  role: string;
  status: "Aktif" | "Diblokir";
  activeBorrowings: number;
};

export type UserRole = "student" | "teacher" | "librarian" | "admin" | "superadmin";

export type Profile = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  memberCode: string;
  grade: string;
};
