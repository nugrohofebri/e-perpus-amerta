"use client";

import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { Icon } from "@/components/Icon";

type CoverUploaderProps = {
  initialPreview?: string | null;
  onFileProcessed: (file: File | null) => void;
};

// --- Fungsi Utility Canvas murni untuk memotong gambar mentah ---
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (error) => reject(error));
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  // Set canvas size match pixel crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image onto canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      resolve(blob);
    }, "image/jpeg", 0.95);
  });
}

export function CoverUploader({ initialPreview, onFileProcessed }: CoverUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreview || null);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  
  // Crop states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setRawImageSrc(reader.result?.toString() || null);
      });
      reader.readAsDataURL(file);
    }
  };

  const cancelCrop = () => {
    setRawImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const applyCropAndCompress = async () => {
    if (!rawImageSrc || !croppedAreaPixels) return;
    try {
      setIsProcessing(true);
      
      // 1. Ekstrak gambar (Crop via Canvas)
      const croppedBlob = await getCroppedImg(rawImageSrc, croppedAreaPixels);
      
      // 2. Buat File dummy awal untuk dikirim ke lib kompresi
      const croppedFile = new File([croppedBlob], "cover.jpg", { type: "image/jpeg" });
      
      // 3. Kompres dengan browser-image-compression (max 300KB)
      const options = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };
      
      const finaleFile = await imageCompression(croppedFile, options);
      
      // Update preview lokal & berikan ke parent
      const url = URL.createObjectURL(finaleFile);
      setPreviewUrl(url);
      onFileProcessed(finaleFile);
      
      // Tutup modal
      setRawImageSrc(null);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat memproses gambar.");
    } finally {
      setIsProcessing(false);
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    onFileProcessed(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <>
      <div className="relative flex aspect-[3/4] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-outline-variant/30 bg-surface-container-high text-center">
        {previewUrl ? (
          <div className="group relative h-full w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Cover Preview" className="h-full w-full object-cover" />
            
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
              <button
                type="button"
                onClick={removeImage}
                className="flex items-center gap-2 rounded-full bg-error px-4 py-2 text-sm font-bold text-white shadow-xl hover:bg-red-600"
              >
                <Icon name="delete" className="text-lg" /> Hapus
              </button>
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-col items-center justify-center p-4">
            <Icon name="add_photo_alternate" className="mb-3 text-4xl text-outline" />
            <span className="text-xs font-bold uppercase tracking-widest text-outline">
              Opsi Upload
            </span>
            <span className="mt-2 text-[10px] text-outline-variant">Gunakan HP / File</span>
            
            <div className="mt-4 flex w-full flex-col gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[11px] font-bold text-white shadow-sm transition hover:bg-primary/90"
              >
                <Icon name="photo_camera" className="text-base" /> Kamera HP
              </button>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-[11px] font-bold text-primary shadow-sm transition hover:bg-slate-50"
              >
                <Icon name="folder_open" className="text-base" /> Pilih File
              </button>
            </div>
          </div>
        )}

        {/* Input sembunyi */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      <p className="mt-4 text-sm leading-6 text-on-surface-variant">
        Rasio gambar adalah 3:4. Jika terlalu besar, bisa dicrop. Akan langsung dikompresi hemat storage.
      </p>

      {/* ── Modal Crop Fullscreen ── */}
      {rawImageSrc && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-slate-900">
          <div className="relative flex-1">
            <Cropper
              image={rawImageSrc}
              crop={crop}
              zoom={zoom}
              aspect={3 / 4}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          
          <div className="flex flex-col gap-4 bg-slate-800 p-6 md:flex-row md:items-center md:justify-between">
             <div className="flex w-full flex-col gap-2 md:max-w-xs">
                <label className="text-xs font-bold text-slate-300">Zoom Gambar: {zoom.toFixed(1)}x</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-primary"
                />
             </div>
             
             <div className="grid grid-cols-2 gap-3 md:flex md:w-auto">
               <button
                 type="button"
                 onClick={cancelCrop}
                 className="rounded-full bg-slate-700 px-6 py-3.5 text-sm font-bold text-slate-200 transition hover:bg-slate-600"
               >
                 Batal
               </button>
               <button
                 type="button"
                 onClick={applyCropAndCompress}
                 disabled={isProcessing}
                 className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-primary/90 disabled:opacity-50"
               >
                 {isProcessing ? (
                   <>
                     <Icon name="refresh" className="animate-spin" /> Memproses
                   </>
                 ) : (
                   <>
                     <Icon name="crop" /> Potong & Simpan
                   </>
                 )}
               </button>
             </div>
          </div>
        </div>
      )}
    </>
  );
}
