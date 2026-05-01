"use client";

import { useTransition, useState } from "react";
import { Icon } from "@/components/Icon";
import { toggleSaveBookAction } from "@/app/catalog/[id]/save-actions";

export function SaveBookButton({ bookId, initialSaved }: { bookId: string; initialSaved: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [isSaved, setIsSaved] = useState(initialSaved);

  const handleToggle = () => {
    setIsSaved(!isSaved); // Optimistic UI update
    startTransition(async () => {
      const res = await toggleSaveBookAction(bookId);
      if (res?.error) {
        setIsSaved(isSaved); // Revert on error
        alert(res.error);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`flex items-center justify-center gap-2 rounded-full px-10 py-4 text-[15px] font-bold transition active:scale-95 disabled:opacity-70 ${
        isSaved
          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      <Icon name={isSaved ? "bookmark" : "bookmark_border"} className="text-[18px]" />
      {isSaved ? "Tersimpan" : "Simpan"}
    </button>
  );
}
