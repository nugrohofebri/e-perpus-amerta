"use client";

import { useTransition } from "react";
import { Icon } from "@/components/Icon";
import { deleteReviewAction } from "./actions";

export function DeleteReviewButton({ reviewId, bookId }: { reviewId: string; bookId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteReviewAction(reviewId, bookId);
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-error-container text-error transition hover:bg-error hover:text-white disabled:opacity-50"
      title="Hapus ulasan"
    >
      <Icon name={isPending ? "hourglass_empty" : "delete"} className="text-[16px]" />
    </button>
  );
}
