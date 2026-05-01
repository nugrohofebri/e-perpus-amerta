"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import type { Book } from "@/lib/types";
import { BookCover } from "@/components/BookCover";
import { Icon } from "@/components/Icon";
import { StatusChip } from "@/components/StatusChip";
import { toggleSaveBookAction } from "@/app/catalog/[id]/save-actions";

type BookCardProps = {
  book: Book;
  compact?: boolean;
  isSaved?: boolean;
  isLoggedIn?: boolean;
};

export function BookCard({ book, compact = false, isSaved: initialSaved = false, isLoggedIn = false }: BookCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isSaved, setIsSaved] = useState(initialSaved);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSaved(!isSaved); // Optimistic UI
    startTransition(async () => {
      const res = await toggleSaveBookAction(book.id);
      if (res?.error) {
        setIsSaved(isSaved);
        alert(res.error);
      }
    });
  };

  const isAvailable = book.status === "available";
  const statusColor = isAvailable ? "bg-green-100 text-green-700" : book.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-neutral-200 text-neutral-700";
  const dotColor = isAvailable ? "bg-green-500" : book.status === "pending" ? "bg-amber-500" : "bg-neutral-500";
  const statusText = isAvailable ? "Tersedia" : book.status === "pending" ? "Antrian" : "Dipinjam";

  return (
    <article className="group flex flex-col rounded-[2.5rem] bg-[#F1F5F9] p-4 transition hover:shadow-sm">
      {/* Container Gambar */}
      <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm">
        {/* Badge Kategori Kiri Atas */}
        <div className="absolute left-4 top-4 z-20 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
          {book.category || "Umum"}
        </div>
        
        <BookCover
          title={book.title}
          author={book.author}
          tone={book.coverTone}
          coverUrl={book.coverUrl}
          className="w-full max-w-[200px] shrink-0 transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Konten Text */}
      <div className="flex flex-1 flex-col px-1 pb-2 pt-5 sm:px-2 sm:pt-6">
        <div className="mb-3 flex items-center justify-start">
          <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] sm:text-[11px] font-bold ${statusColor}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
            {statusText}
          </div>
        </div>
        
        <h3 className="mb-1.5 font-headline text-lg sm:text-xl font-extrabold leading-snug tracking-tight text-secondary line-clamp-2">
          {book.title}
        </h3>
        <p className="text-xs sm:text-sm font-medium text-on-surface-variant line-clamp-1">
          Oleh {book.author}
        </p>
        
        {/* Tombol Bawah */}
        <div className="mt-auto pt-5 sm:pt-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={`/catalog/${book.id}`}
              className="flex flex-1 items-center justify-center rounded-full bg-[#005B96] px-4 py-2.5 sm:px-6 text-xs sm:text-[13px] font-bold text-white transition hover:bg-[#004A7A] active:scale-95"
            >
              Lihat Detail
            </Link>
            {isLoggedIn && (
              <button 
                onClick={handleToggleSave}
                disabled={isPending}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition active:scale-95 disabled:opacity-70 ${
                  isSaved 
                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200" 
                    : "bg-[#E2E8F0] text-secondary hover:bg-[#CBD5E1] hover:text-primary"
                }`}
              >
                <Icon name={isSaved ? "bookmark" : "bookmark_border"} className="text-lg" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
