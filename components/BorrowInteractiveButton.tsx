"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { createBorrowingAction, deleteExpiredBorrowingAction } from "@/app/catalog/[id]/actions";
import { createClient } from "@/lib/supabase/client";

const LIMIT_SECONDS = 5 * 60;

type BorrowButtonProps = {
  isLoggedIn: boolean;
  isAvailable: boolean;
  bookTitle: string;
  bookId: string;
};

export function BorrowInteractiveButton({ isLoggedIn, isAvailable, bookTitle, bookId }: BorrowButtonProps) {
  const router = useRouter();
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [finalSuccessModal, setFinalSuccessModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [borrowingId, setBorrowingId] = useState("");
  const [remaining, setRemaining] = useState(LIMIT_SECONDS);
  const [expired, setExpired] = useState(false);

  // Countdown saat modal sukses terbuka
  useEffect(() => {
    if (!showSuccessModal) return;
    setRemaining(LIMIT_SECONDS);
    setExpired(false);
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) { clearInterval(interval); setExpired(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showSuccessModal]);

  // Auto-hapus data peminjaman saat kadaluarsa
  useEffect(() => {
    if (expired && borrowingId) {
      deleteExpiredBorrowingAction(borrowingId);
    }
  }, [expired, borrowingId]);

  // Polling deteksi petugas sudah menyetujui Peminjaman via Scanner
  useEffect(() => {
    if (!showSuccessModal || !borrowingId || expired) return;

    let isMounted = true;
    const checkStatus = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.from("borrowings").select("status").eq("id", borrowingId).single();
        if (isMounted && data?.status === "borrowed") {
          setShowSuccessModal(false);
          setFinalSuccessModal(true);
        }
      } catch (e) {} // abaikan
    };

    const interval = setInterval(checkStatus, 2000); // Polling detak 2 detik sekali
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [showSuccessModal, borrowingId, expired, router]);

  const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secs = String(remaining % 60).padStart(2, "0");
  const isWarning = remaining <= 60 && remaining > 0;
  const isCritical = remaining <= 30 && remaining > 0;

  const handleBorrow = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    setIsBorrowing(true);
    setErrorMsg("");

    try {
      const result = await createBorrowingAction(bookId);
      
      if (result.success && result.borrowingId) {
        setBorrowingId(result.borrowingId);
        setShowSuccessModal(true);
      } else {
        setErrorMsg(result.error || "Gagal memproses peminjaman.");
      }
    } catch (e) {
      setErrorMsg("Koneksi bermasalah.");
    } finally {
      setIsBorrowing(false);
    }
  };

  return (
    <>
      <button
        onClick={handleBorrow}
        disabled={!isAvailable || isBorrowing}
        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#0ea5e9] py-4 text-[15px] font-bold text-white shadow-md shadow-sky-500/20 transition hover:bg-sky-600 active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
      >
        {isBorrowing && <Icon name="refresh" className="animate-spin text-lg" />}
        {isBorrowing ? "Memproses..." : "Pinjam Buku"}
      </button>

      {/* Pesan Error (Inline Toast) */}
      {errorMsg && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-5 rounded-full bg-red-100 px-6 py-3 font-semibold text-red-700 shadow-xl">
          {errorMsg}
        </div>
      )}

      {/* Modal Popup Login Gagal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm scale-100 rounded-[2rem] bg-white p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Icon name="lock" className="text-3xl" />
            </div>
            <h3 className="font-headline text-2xl font-extrabold text-slate-800">Akses Ditolak</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Anda harus memiliki akun aktif dan terdaftar untuk meminjam buku. Mari verifikasi identitas Anda terlebih dahulu.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={() => router.push("/login")}
                className="w-full rounded-full bg-blue-600 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-95"
              >
                Masuk / Login Akun
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full rounded-full bg-slate-100 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-200 active:scale-95"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Popup Peminjaman Sukses Berisi QR + Countdown */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm max-h-full overflow-y-auto rounded-[2rem] bg-white p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="mb-1 flex items-center justify-between">
              <h3 className="font-headline text-xl font-extrabold text-slate-800">QR Peminjaman</h3>
              <button onClick={() => setShowSuccessModal(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
                <Icon name="close" className="text-lg" />
              </button>
            </div>
            <p className="mb-5 text-sm text-slate-500 line-clamp-1">{bookTitle}</p>

            {expired ? (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
                  <Icon name="timer_off" className="text-3xl" />
                </div>
                <div>
                  <p className="font-headline text-lg font-extrabold text-red-600">QR Code Kadaluarsa</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    Batas waktu 5 menit telah habis. Harap klik Pinjam Buku lagi untuk mendapatkan QR baru.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* QR */}
                <div className={`mx-auto flex h-52 w-52 items-center justify-center overflow-hidden rounded-2xl border-4 bg-white p-3 shadow-sm transition-colors ${isCritical ? "border-red-300" : isWarning ? "border-amber-300" : "border-slate-100"}`}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=BORROW:${borrowingId}`}
                    alt="QR Code Peminjaman"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Countdown */}
                <div className={`mt-5 flex flex-col items-center gap-1 rounded-2xl px-4 py-3 transition-colors ${
                  isCritical ? "bg-red-50" : isWarning ? "bg-amber-50" : "bg-slate-50"
                }`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sisa Waktu Berlaku</p>
                  <div className={`font-mono text-4xl font-extrabold tabular-nums tracking-tight ${
                    isCritical ? "text-red-600 animate-pulse" : isWarning ? "text-amber-600" : "text-slate-800"
                  }`}>
                    {mins}:{secs}
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
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
              Berikan kode QR ini kepada <strong className="text-slate-800">Petugas Pustakawan</strong> agar buku <strong className="text-slate-800">"{bookTitle}"</strong> segera diserahkan kepada Anda.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => { setShowSuccessModal(false); router.push("/borrowings"); }}
                className="w-full rounded-full bg-blue-600 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-95"
              >
                Lihat di Peminjaman Saya
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full rounded-full bg-slate-100 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-200 active:scale-95"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Popup Peminjaman Sukses Akhir (Setelah Admin Scan) */}
      {finalSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 px-4 py-8 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Icon name="verified" className="text-5xl" />
            </div>
            
            <h3 className="font-headline text-2xl font-extrabold text-slate-800">
              Berhasil Dipinjam!
            </h3>
            
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Selamat membaca! Buku <strong className="text-slate-800">"{bookTitle}"</strong> telah diserahkan dan resmi Anda pinjam. Jangan lupa amati tanggal pengembaliannya ya.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={() => {
                  setFinalSuccessModal(false);
                  router.push("/borrowings");
                }}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-white transition hover:bg-primary/90 active:scale-95"
              >
                <Icon name="history_edu" className="text-lg" />
                Lihat Peminjaman Saya
              </button>
              <button
                onClick={() => setFinalSuccessModal(false)}
                className="w-full rounded-full bg-surface-container py-3.5 text-sm font-bold text-on-surface transition hover:bg-surface-container-high active:scale-95"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
