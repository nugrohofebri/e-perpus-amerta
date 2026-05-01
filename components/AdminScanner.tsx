"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";

import { BrowserQRCodeReader } from "@zxing/library";

type CameraFacing = "environment" | "user";
type CameraDevice = { deviceId: string; label: string };
type ScanRecord = { rawValue: string; format: string; scannedAt: string };
type CamState = "idle" | "requesting" | "denied" | "active";

import { approveBorrowingAction, returnBorrowingAction } from "@/app/admin/scan/actions";

export function AdminScanner() {
  // Refs — tidak menyebabkan re-render
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const lastScannedRef = useRef<string>("");
  const isProcessingRef = useRef<boolean>(false);

  const [camState, setCamState] = useState<CamState>("idle");
  const [status, setStatus] = useState("Tekan tombol untuk mengaktifkan kamera.");
  const [error, setError] = useState("");
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [facingMode, setFacingMode] = useState<CameraFacing>("environment");
  const [scanResult, setScanResult] = useState<ScanRecord | null>(null);
  const [history, setHistory] = useState<ScanRecord[]>([]);

  const [adminSuccessModal, setAdminSuccessModal] = useState<{ type: "borrow" | "return"; message: string } | null>(null);

  const router = useRouter();

  // ─── Stop semua ──────────────────────────────────────────────────────
  function stopAll() {
    if (scanTimerRef.current) { clearInterval(scanTimerRef.current); scanTimerRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
  }

  // ─── Pasang stream ke video saat element siap ─────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (camState === "active" && streamRef.current) {
      video.srcObject = streamRef.current;
      video.play().catch(() => {
        setTimeout(() => video.play().catch(() => {}), 300);
      });
    } else if (camState !== "active") {
      video.pause();
      video.srcObject = null;
    }
  }, [camState]);

  // ─── Mulai kamera ────────────────────────────────────────────────────
  async function startScanner(overrideDeviceId?: string, overrideFacing?: CameraFacing) {
    // Cek apakah konteks aman (HTTPS atau localhost)
    const isSecureContext = window.isSecureContext;
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    
    if (!isSecureContext && !isLocalhost) {
      setError(
        "Akses kamera memerlukan HTTPS. Halaman ini sedang diakses via HTTP dari jaringan lokal. Lihat panduan di bawah untuk mengaktifkan HTTPS."
      );
      setCamState("denied");
      return;
    }
    
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Browser tidak mendukung akses kamera. Gunakan Chrome atau Safari versi terbaru."); 
      setCamState("denied"); 
      return;
    }

    stopAll();
    setCamState("requesting");
    setError("");
    setStatus("Membuka kamera…");

    const deviceId = overrideDeviceId ?? selectedDeviceId;
    const facing = overrideFacing ?? facingMode;

    try {
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      try {
        const all = await navigator.mediaDevices.enumerateDevices();
        const cams = all
          .filter((d) => d.kind === "videoinput")
          .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Kamera ${i + 1}` }));
        setDevices(cams);
        if (!selectedDeviceId && cams[0]?.deviceId) setSelectedDeviceId(cams[0].deviceId);
      } catch { /* abaikan */ }

      setCamState("active");

      if (!readerRef.current) {
         readerRef.current = new BrowserQRCodeReader();
      }
      
      setStatus("✅ Kamera aktif — arahkan ke QR code.");

      scanTimerRef.current = window.setInterval(async () => {
        const video = videoRef.current;
        const reader = readerRef.current;
        if (!video || video.readyState < 2 || video.paused || !reader || isProcessingRef.current) return;
        try {
          const result = reader.decode(video);
          if (result && result.getText() && result.getText() !== lastScannedRef.current) {
            const rawValue = result.getText();
            lastScannedRef.current = rawValue;
            
            isProcessingRef.current = true;
            setStatus("Memproses permintaan QR...");

            let successStatusMessage = "✅ QR berhasil dibaca!";

            // Jika awalan adalah payload peminjaman buku
            if (rawValue.startsWith("BORROW:")) {
               const borrowId = rawValue.split(":")[1];
               const apiReq = await approveBorrowingAction(borrowId);
               if (apiReq.success) {
                 successStatusMessage = "📚 Peminjaman Disetujui: " + apiReq.message;
                 setAdminSuccessModal({ type: "borrow", message: apiReq.message || "Buku berhasil diserahkan ke siswa." });
               } else {
                 successStatusMessage = "❌ Ditolak: " + apiReq.error;
                 alert("Transaksi Gagal diproses: " + apiReq.error);
               }
            } 
            // Jika awalan adalah payload pengembalian buku
            else if (rawValue.startsWith("RETURN:")) {
               const borrowId = rawValue.split(":")[1];
               const apiReq = await returnBorrowingAction(borrowId);
               if (apiReq.success) {
                 successStatusMessage = "✅ Pengembalian Selesai: " + apiReq.message;
                 setAdminSuccessModal({ type: "return", message: apiReq.message || "Buku berhasil dikembalikan dan stok bertambah." });
               } else {
                 successStatusMessage = "❌ Ditolak: " + apiReq.error;
                 alert("Pengembalian Gagal: " + apiReq.error);
               }
            }

            const rec: ScanRecord = {
              rawValue,
              format: "qr_code",
              scannedAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
            };
            setScanResult(rec);
            setHistory((h) => [rec, ...h.filter((x) => x.rawValue !== rec.rawValue)].slice(0, 5));
            setStatus(successStatusMessage);

            // Jeda sementara sebelum baca qr lain
            setTimeout(() => {
              isProcessingRef.current = false;
            }, 3000);
          }
        } catch { /* abaikan */ }
      }, 700);

    } catch (err) {
      stopAll();
      setCamState("denied");
      const e = err instanceof Error ? err : new Error("Unknown");
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        const isHttp = window.location.protocol === "http:" && window.location.hostname !== "localhost";
        if (isHttp) {
          setError("Kamera diblokir karena halaman diakses via HTTP (bukan HTTPS). Gunakan HTTPS untuk akses dari HP. Lihat panduan di bawah.");
        } else {
          setError("Izin kamera ditolak. Ketuk ikon 🔒 atau ⓘ di address bar → Izin Kamera → Izinkan, lalu muat ulang halaman.");
        }
      } else if (e.name === "NotFoundError") {
        setError("Tidak ada kamera yang terdeteksi di perangkat ini.");
      } else if (e.name === "NotReadableError" || e.name === "TrackStartError") {
        setError("Kamera sedang dipakai aplikasi lain. Tutup aplikasi kamera lain lalu coba lagi.");
      } else if (e.name === "SecurityError") {
        setError("Akses kamera diblokir karena alasan keamanan. Pastikan halaman diakses via HTTPS.");
      } else {
        setError(e.message || "Gagal membuka kamera.");
      }
      setStatus("Kamera tidak dapat diakses.");
    }
  }

  // Cleanup saat unmount
  useEffect(() => () => stopAll(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const parsedType = !scanResult ? "Belum ada"
    : scanResult.rawValue.startsWith("MBR-") ? "Member"
    : scanResult.rawValue.startsWith("BK-") ? "Book"
    : scanResult.rawValue.startsWith("BORROW:") ? "Peminjaman Buku"
    : "QR Data";

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">

      {/* ── Camera Panel ── */}
      <section className="overflow-hidden rounded-[2rem] bg-inverse-surface text-white shadow-ambient">

        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-inverse-primary">Live Camera</p>
            <p className="mt-1 text-sm text-white/70">{status}</p>
          </div>
          {camState !== "idle" && (
            <button
              disabled={camState === "requesting"}
              onClick={() => void startScanner()}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/20 disabled:opacity-50"
              type="button"
            >
              <Icon name="refresh" className="text-lg" /> Muat Ulang
            </button>
          )}
        </div>

        <div className="p-4 sm:p-5">

          {/* IDLE */}
          {camState === "idle" && (
            <div className="flex flex-col items-center gap-6 rounded-[1.6rem] bg-white/5 py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                <Icon name="videocam" className="text-5xl text-inverse-primary" />
              </div>
              <div className="max-w-xs">
                <p className="font-headline text-xl font-extrabold">Aktifkan Kamera</p>
                <p className="mt-2 text-sm text-white/60">
                  Klik tombol di bawah, lalu pilih <strong>&ldquo;Allow&rdquo;</strong> saat browser meminta izin kamera.
                </p>
              </div>
              <button
                onClick={() => void startScanner()}
                className="flex items-center gap-2 rounded-full bg-inverse-primary px-8 py-4 font-bold text-inverse-surface transition hover:scale-105 active:scale-95"
                type="button"
              >
                <Icon name="videocam" /> Mulai Kamera
              </button>
            </div>
          )}

          {/* REQUESTING */}
          {camState === "requesting" && (
            <div className="flex flex-col items-center gap-4 rounded-[1.6rem] bg-white/5 py-16 text-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-inverse-primary" />
              <p className="text-sm text-white/70">Membuka kamera…</p>
              <p className="text-xs text-white/40">Pilih &ldquo;Allow&rdquo; di dialog browser jika muncul</p>
            </div>
          )}

          {/* DENIED */}
          {camState === "denied" && (
            <div className="flex flex-col gap-5 rounded-[1.6rem] bg-white/5 p-6 text-left">
              <div className="flex items-center gap-3">
                <Icon name="no_photography" className="text-4xl text-error shrink-0" />
                <div>
                  <p className="font-bold text-error">Kamera Tidak Dapat Diakses</p>
                  <p className="mt-1 text-sm text-white/60">{error}</p>
                </div>
              </div>

              {/* Panduan HTTPS untuk HP */}
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-400">
                  <Icon name="smartphone" className="text-lg" />
                  Akses dari HP / Tablet
                </p>
                <p className="mb-3 text-xs text-white/60">
                  Kamera HP memerlukan <strong className="text-white">HTTPS</strong>. Ikuti salah satu cara berikut:
                </p>
                <div className="space-y-3 text-xs text-white/60">
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="mb-1 font-bold text-amber-400">Cara 1 — Server HTTPS (Direkomendasikan)</p>
                    <p className="mb-1">Di terminal komputer, jalankan:</p>
                    <code className="block rounded bg-black/40 px-3 py-2 font-mono text-[11px] text-green-400">
                      npm run dev:https-network
                    </code>
                    <p className="mt-2">Akses dari HP: <strong className="text-white">https://[IP-Komputer]:3000</strong></p>
                    <p className="mt-1 text-white/40">IP komputer: jalankan <code>ipconfig</code> di cmd Windows</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="mb-1 font-bold text-amber-400">Cara 2 — Chrome Android Flag</p>
                    <ol className="list-inside list-decimal space-y-1">
                      <li>Buka <code className="rounded bg-black/40 px-1 font-mono text-[10px]">chrome://flags</code></li>
                      <li>Cari <strong>&ldquo;Insecure origins treated as secure&rdquo;</strong></li>
                      <li>Isi <code className="font-mono text-[10px]">http://[IP-PC]:3000</code></li>
                      <li>Aktifkan &rarr; Restart Chrome</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 text-xs text-white/50">
                <p className="mb-2 font-bold text-white/70">Sudah HTTPS tapi kamera masih diblokir?</p>
                <ol className="list-inside list-decimal space-y-1">
                  <li>Ketuk ikon 🔒 atau ⓘ di address bar</li>
                  <li>Pilih <strong>Izin / Permissions &rarr; Kamera &rarr; Izinkan</strong></li>
                  <li>Muat ulang halaman</li>
                </ol>
              </div>

              <button
                onClick={() => { setCamState("idle"); setError(""); setStatus("Tekan tombol untuk mengaktifkan kamera."); }}
                className="w-full rounded-full bg-white/10 px-6 py-3 text-sm font-bold hover:bg-white/20"
                type="button"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* ACTIVE — controls */}
          {camState === "active" && (
            <div className="mb-4 grid gap-3 md:grid-cols-2">
              {/* Facing mode toggle */}
              <div className="flex rounded-2xl bg-white/10 p-1">
                {(["environment", "user"] as CameraFacing[]).map((mode) => (
                  <button
                    key={mode}
                    className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold transition ${facingMode === mode ? "bg-white text-inverse-surface" : "text-white/60 hover:bg-white/10"}`}
                    onClick={() => { setFacingMode(mode); setSelectedDeviceId(""); void startScanner("", mode); }}
                    type="button"
                  >
                    {mode === "environment" ? "Kamera Belakang" : "Kamera Depan"}
                  </button>
                ))}
              </div>
              {/* Device select */}
              {devices.length > 1 && (
                <select
                  className="rounded-2xl border-0 bg-white/10 px-4 py-3 text-sm text-white"
                  value={selectedDeviceId}
                  onChange={(e) => { setSelectedDeviceId(e.target.value); void startScanner(e.target.value); }}
                >
                  {devices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId} className="text-black">{d.label}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/*
            VIDEO ELEMENT — SELALU ADA DI DOM.
            Hanya visibility-nya yang berubah.
            Ini kunci agar videoRef.current selalu valid saat stream dipasang.
          */}
          <div className={camState === "active" ? "block" : "hidden"}>
            <div className="relative overflow-hidden rounded-[1.6rem] bg-black">
              <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
              {/* Scan frame */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-52 w-52 -translate-x-1/2 -translate-y-1/2 sm:h-64 sm:w-64">
                <div className="absolute left-0 top-0 h-8 w-8 rounded-tl-lg border-l-2 border-t-2 border-inverse-primary" />
                <div className="absolute right-0 top-0 h-8 w-8 rounded-tr-lg border-r-2 border-t-2 border-inverse-primary" />
                <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-lg border-b-2 border-l-2 border-inverse-primary" />
                <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-lg border-b-2 border-r-2 border-inverse-primary" />
                <div className="absolute left-2 right-2 top-1/2 h-0.5 animate-pulse bg-inverse-primary/70" />
              </div>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="aspect-[4/5] w-full object-cover sm:aspect-video"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ── Result Panel ── */}
      <aside className="grid gap-4 self-start">
        <div className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-headline text-xl font-extrabold">Hasil Scan</h2>
          <div className="mt-5 grid gap-3">
            <ResultCard label="Jenis" value={parsedType} />
            <ResultCard label="Nilai QR" value={scanResult?.rawValue ?? "Belum ada hasil"} />
            <ResultCard label="Format" value={scanResult?.format ?? "qr_code"} />
            <ResultCard label="Jam Scan" value={scanResult?.scannedAt ?? "-"} />
          </div>
          <button
            className="mt-5 w-full rounded-full bg-primary px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!scanResult}
            type="button"
          >
            Konfirmasi Transaksi
          </button>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-xl font-extrabold">Riwayat Cepat</h2>
            <button
              className="rounded-full bg-surface-container px-3 py-1.5 text-xs font-bold text-primary"
              onClick={() => { setHistory([]); setScanResult(null); lastScannedRef.current = ""; }}
              type="button"
            >
              Bersihkan
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {history.length ? history.map((item) => (
              <div key={`${item.rawValue}-${item.scannedAt}`} className="rounded-2xl bg-surface-container-low p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">{item.scannedAt}</p>
                <p className="mt-2 break-all font-semibold">{item.rawValue}</p>
              </div>
            )) : (
              <div className="rounded-2xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
                Belum ada QR yang terbaca di sesi ini.
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Admin Success Popup Modal */}
      {adminSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-sm scale-100 overflow-hidden rounded-[2rem] bg-white p-6 text-center shadow-2xl md:p-8 animate-in zoom-in-95 duration-200">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Icon name="check_circle" className="text-5xl" />
            </div>
            <h2 className="font-headline text-2xl font-extrabold text-slate-800">
              {adminSuccessModal.type === "borrow" ? "Peminjaman Berhasil!" : "Pengembalian Selesai!"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              {adminSuccessModal.message}
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={() => {
                  setAdminSuccessModal(null);
                  router.push("/admin/borrowings");
                }}
                className="w-full rounded-full bg-primary py-3.5 text-sm font-bold text-white transition hover:bg-primary/90 active:scale-95"
              >
                Lihat Daftar Peminjaman
              </button>
              <button
                onClick={() => setAdminSuccessModal(null)}
                className="w-full rounded-full bg-surface-container py-3.5 text-sm font-bold text-on-surface transition hover:bg-surface-container-high active:scale-95"
              >
                Tutup & Lanjut Scan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-container-low p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-primary">{label}</p>
      <p className="mt-2 break-all font-semibold text-on-surface">{value}</p>
    </div>
  );
}
