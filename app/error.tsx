"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-container-low px-4 text-center">
      {/* Animated illustration container */}
      <div className="relative mb-8 flex h-40 w-40 items-center justify-center rounded-full bg-red-50">
        <Icon name="error_outline" className="z-10 text-7xl text-error" />
        
        {/* Floating elements */}
        <Icon name="healing" className="absolute -right-2 top-0 z-20 animate-bounce text-3xl text-amber-500" style={{ animationDelay: "0.2s" }} />
        <Icon name="engineering" className="absolute -left-2 bottom-4 z-20 animate-bounce text-3xl text-blue-400" style={{ animationDelay: "0.4s" }} />
      </div>

      <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.28em] text-error">
        Terjadi Kesalahan Sistem
      </p>
      
      <h1 className="mb-4 font-headline text-4xl font-extrabold tracking-tight md:text-5xl">
        Ups! Sesuatu Bermasalah
      </h1>
      
      <p className="mb-10 max-w-md text-on-surface-variant leading-relaxed">
        Maaf, kami mengalami kendala teknis saat memuat halaman ini (mungkin masalah jaringan atau server). Tim engineer kami akan mengeceknya.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button 
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 rounded-full bg-error px-8 py-3.5 text-sm font-bold text-white shadow-soft transition hover:scale-105 hover:bg-error/90 active:scale-95"
        >
          <Icon name="refresh" />
          Coba Muat Ulang
        </button>
        <Link 
          href="/" 
          className="flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
        >
          <Icon name="home" />
          Beranda Utama
        </Link>
      </div>
    </div>
  );
}
