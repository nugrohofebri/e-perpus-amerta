"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { deleteExpiredBorrowingAction } from "@/app/catalog/[id]/actions";
import { createClient } from "@/lib/supabase/client";

type ShowQRButtonProps = {
  borrowingId: string;
  bookTitle: string;
  createdAt?: string;
};

const LIMIT_SECONDS = 5 * 60; // 5 menit

function getRemainingSeconds(createdAt?: string): number {
  if (!createdAt) return LIMIT_SECONDS;
  const created = new Date(createdAt).getTime();
  const elapsed = Math.floor((Date.now() - created) / 1000);
  return Math.max(0, LIMIT_SECONDS - elapsed);
}

export function ShowQRButton({ borrowingId, bookTitle, createdAt }: ShowQRButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [remaining, setRemaining] = useState(() => getRemainingSeconds(createdAt));
  const [expired, setExpired] = useState(false);

  // Mulai countdown saat modal dibuka
  useEffect(() => {
    if (!showModal) return;

    // Reset state setiap kali modal dibuka
    const initialSecs = getRemainingSeconds(createdAt);
    setRemaining(initialSecs);
    setExpired(initialSecs <= 0);

    if (initialSecs <= 0) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(interval);
          setExpired(true);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showModal, createdAt]);

  // Auto-hapus data peminjaman saat kadaluarsa
  useEffect(() => {
    if (expired && borrowingId) {
      deleteExpiredBorrowingAction(borrowingId);
    }
  }, [expired, borrowingId]);

  // Polling deteksi petugas sudah menyetujui Peminjaman via Scanner
  useEffect(() => {
    if (!showModal || !borrowingId || expired) return;

    let isMounted = true;
    const checkStatus = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.from("borrowings").select("status").eq("id", borrowingId).single();
        if (isMounted && data?.status === "borrowed") {
          setShowModal(false);
          router.refresh(); // Refresh halaman Peminjaman Saya agar item Menunggu langsung berganti ke Aktif
        }
      } catch (e) {} // abaikan
    };

    const interval = setInterval(checkStatus, 2000); // Polling detak 2 detik sekali
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [showModal, borrowingId, expired, router]);

  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");
  const isWarning = remaining <= 60 && remaining > 0;
  const isCritical = remaining <= 30 && remaining > 0;

  return (
    <>
      {/* Tombol Tampilkan QR */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-amber-700 transition hover:bg-amber-200 active:scale-95"
      >
        <Icon name="qr_code_scanner" className="text-sm" />
        Tampilkan QR
      </button>

      {/* Modal QR Code */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">

            {/* Header */}
            <div className="mb-1 flex items-center justify-between">
              <h3 className="font-headline text-xl font-extrabold text-slate-800">QR Peminjaman</h3>
              <button
                onClick={() => setShowModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >
                <Icon name="close" className="text-lg" />
              </button>
            </div>
            <p className="mb-5 text-sm text-slate-500 line-clamp-1">{bookTitle}</p>

            {expired ? (
              /* Tampilan Kadaluarsa */
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
                  <Icon name="timer_off" className="text-3xl" />
                </div>
                <div>
                  <p className="font-headline text-lg font-extrabold text-red-600">QR Code Kadaluarsa</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    Batas waktu 5 menit telah habis. Harap kunjungi halaman detail buku dan buat permintaan pinjam baru.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* QR Image */}
                <div className={`mx-auto flex h-52 w-52 items-center justify-center overflow-hidden rounded-2xl border-4 bg-white p-3 shadow-sm transition-colors ${isCritical ? "border-red-300" : isWarning ? "border-amber-300" : "border-slate-100"}`}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=BORROW:${borrowingId}`}
                    alt="QR Code Peminjaman"
                    className="h-full w-full object-contain"
                  />
                </div>

                {/* Countdown Timer */}
                <div className={`mt-5 flex flex-col items-center gap-1 rounded-2xl px-4 py-3 transition-colors ${
                  isCritical ? "bg-red-50"
                  : isWarning ? "bg-amber-50"
                  : "bg-slate-50"
                }`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sisa Waktu Berlaku</p>
                  <div className={`font-mono text-4xl font-extrabold tabular-nums tracking-tight transition-colors ${
                    isCritical ? "text-red-600 animate-pulse"
                    : isWarning ? "text-amber-600"
                    : "text-slate-800"
                  }`}>
                    {minutes}:{seconds}
                  </div>
                  <div className={`mt-1 h-1.5 w-full rounded-full overflow-hidden bg-slate-200`}>
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        isCritical ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-green-500"
                      }`}
                      style={{ width: `${(remaining / LIMIT_SECONDS) * 100}%` }}
                    />
                  </div>
                </div>
              </>
            )}

            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              Tunjukkan kode ini ke <strong className="text-slate-800">Petugas Pustakawan</strong> untuk mengambil buku Anda.
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="mt-5 w-full rounded-full bg-slate-100 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200 active:scale-95"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
