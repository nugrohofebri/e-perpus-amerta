import type { Book, Borrowing, Member } from "@/lib/types";

export const books: Book[] = [];

export const borrowings: Borrowing[] = [];

export const members: Member[] = [
  {
    id: "MBR-1024",
    name: "Ahmad Rizky",
    grade: "XI IPA 2",
    email: "ahmad.rizky@sekolah.id",
    status: "Aktif",
    activeBorrowings: 2
  },
  {
    id: "MBR-1025",
    name: "Nadia Putri",
    grade: "X IPS 1",
    email: "nadia.putri@sekolah.id",
    status: "Aktif",
    activeBorrowings: 1
  },
  {
    id: "MBR-1026",
    name: "Bima Prasetyo",
    grade: "XII Bahasa",
    email: "bima.prasetyo@sekolah.id",
    status: "Diblokir",
    activeBorrowings: 0
  }
];
