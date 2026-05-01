"use client";

import { useTransition, useState } from "react";
import { Icon } from "@/components/Icon";
import { deleteBookAction } from "@/app/admin/catalog/actions";

type DeleteBookButtonProps = {
  bookId: string;
  bookTitle: string;
};

export function DeleteBookButton({ bookId, bookTitle }: DeleteBookButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteBookAction(bookId);
      if (result?.error) {
        alert(`Gagal menghapus: ${result.error}`);
      }
      setShowModal(false);
    });
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-error-container text-error transition hover:bg-error hover:text-white"
        title="Hapus buku"
      >
        <Icon name="delete" className="text-[18px]" />
      </button>

      {/* Modal Konfirmasi */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-7 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-error-container text-error">
              <Icon name="warning" className="text-3xl" />
            </div>
            
            <h3 className="font-headline text-xl font-extrabold text-slate-800">Hapus Buku?</h3>
            
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Menghapus buku <strong className="font-bold text-slate-700">"{bookTitle}"</strong> akan menghilangkan data katalog ini secara permanen. Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                className="flex-1 rounded-full bg-slate-100 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
                onClick={() => setShowModal(false)}
                disabled={isPending}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-error py-3 text-sm font-bold text-white shadow-soft transition hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-70"
              >
                {isPending ? <Icon name="hourglass_empty" className="animate-spin text-lg" /> : "Ya, Hapus!"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
