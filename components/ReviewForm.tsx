"use client";

import { useState, useTransition } from "react";
import { addReviewAction } from "@/app/catalog/[id]/review-actions";

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-3xl transition-transform hover:scale-110 active:scale-95"
        >
          <span className={(hovered || value) >= star ? "text-amber-400" : "text-slate-200"}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

export function ReviewForm({ bookId, existingRating = 0, existingComment = "" }: {
  bookId: string;
  existingRating?: number;
  existingComment?: string;
}) {
  const [rating, setRating] = useState(existingRating);
  const [comment, setComment] = useState(existingComment);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError("Pilih bintang terlebih dahulu."); return; }
    setError(null);
    startTransition(async () => {
      const res = await addReviewAction(bookId, rating, comment);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    });
  };

  if (success) {
    return (
      <div className="rounded-3xl bg-green-50 p-6 text-center border border-green-100">
        <span className="text-4xl">🎉</span>
        <p className="mt-3 font-bold text-green-700">Ulasan berhasil disimpan!</p>
        <button onClick={() => setSuccess(false)} className="mt-4 text-xs font-bold text-primary hover:underline">
          Ubah ulasan
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl bg-gradient-to-br from-surface-container-low to-white p-6 shadow-sm border border-surface-container">
      <h3 className="font-headline text-lg font-extrabold text-slate-800">Bagikan Kesanmu</h3>
      <p className="mt-1 text-sm text-slate-500">Bagaimana pengalaman membaca buku ini?</p>
      
      <div className="mt-5">
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Tulis ulasanmu di sini..."
        className="mt-4 w-full rounded-2xl border border-surface-container-high bg-white p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />

      {error && <p className="mt-2 text-xs font-bold text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isPending || rating === 0}
        className="mt-4 w-full rounded-full bg-primary py-3 text-sm font-bold text-white transition hover:bg-primary/90 active:scale-95 disabled:opacity-50"
      >
        {isPending ? "Menyimpan..." : existingRating ? "Perbarui Ulasan" : "Kirim Ulasan"}
      </button>
    </form>
  );
}
