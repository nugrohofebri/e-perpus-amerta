"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { createClient } from "@/lib/supabase/client";

type ReturnQRButtonProps = {
  borrowingId: string;
  bookTitle: string;
};

export function ReturnQRButton({ borrowingId, bookTitle }: ReturnQRButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  // Polling deteksi petugas sudah memindai QR Pengembalian
  useEffect(() => {
    if (!showModal || !borrowingId) return;

    let isMounted = true;
    const checkStatus = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.from("borrowings").select("status").eq("id", borrowingId).single();
        if (isMounted && data?.status === "returned") {
          setShowModal(false);
          router.refresh(); // Refresh otomatis memindah status "Aktif" menjadi "Selesai"
        }
      } catch (e) {} // abaikan
    };

    const interval = setInterval(checkStatus, 2000); // Polling detak 2 detik sekali
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [showModal, borrowingId, router]);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-600 transition hover:bg-slate-200 active:scale-95"
      >
        <Icon name="qr_code_scanner" className="text-sm text-slate-500" />
        Kembalikan Buku
      </button>

      {/* Modal QR Code RETURN */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="mb-1 flex items-center justify-between">
              <h3 className="font-headline text-xl font-extrabold text-slate-800">QR Pengembalian</h3>
              <button
                onClick={() => setShowModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >
                <Icon name="close" className="text-lg" />
              </button>
            </div>

            <p className="mb-5 text-sm text-slate-500 line-clamp-1">
              Buku: {bookTitle}
            </p>

            {/* QR Image untuk RETURN */}
            <div className="mx-auto flex h-52 w-52 items-center justify-center overflow-hidden rounded-2xl border-4 border-slate-100 bg-white p-3 shadow-sm">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=RETURN:${borrowingId}`}
                alt="QR Code Pengembalian"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-600">
              <Icon name="verified_user" className="text-sm" />
              QR Siap Dipindai Petugas
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              Tunjukkan kode ini ke <strong className="text-slate-800">Pustakawan</strong> untuk memproses pengembalian perpustakaan Anda secara sistem.
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full rounded-full bg-slate-100 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200 active:scale-95"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
