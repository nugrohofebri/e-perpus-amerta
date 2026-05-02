"use client";

import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-container-low px-4 text-center">
      {/* Animated illustration container */}
      <div className="relative mb-8 flex h-40 w-40 items-center justify-center rounded-full bg-blue-50">
        <div className="absolute h-full w-full animate-ping rounded-full bg-blue-100 opacity-50 duration-1000"></div>
        <Icon name="travel_explore" className="z-10 text-7xl text-primary" />
        
        {/* Floating elements */}
        <Icon name="search_off" className="absolute -right-2 top-0 z-20 animate-bounce text-3xl text-amber-500" style={{ animationDelay: "0.2s" }} />
        <Icon name="menu_book" className="absolute -left-2 bottom-4 z-20 animate-bounce text-3xl text-sky-400" style={{ animationDelay: "0.4s" }} />
      </div>

      <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.28em] text-primary">
        Error 404
      </p>
      
      <h1 className="mb-4 font-headline text-4xl font-extrabold tracking-tight md:text-5xl">
        Halaman Tidak Ditemukan
      </h1>
      
      <p className="mb-10 max-w-md text-on-surface-variant leading-relaxed">
        Buku atau halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau Anda salah memasukkan alamat URL.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link 
          href="/" 
          className="flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-soft transition hover:scale-105 hover:bg-primary/90 active:scale-95"
        >
          <Icon name="home" />
          Beranda Utama
        </Link>
        <Link 
          href="/catalog" 
          className="flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-primary shadow-sm transition hover:bg-slate-50 active:scale-95"
        >
          <Icon name="search" />
          Cari di Katalog
        </Link>
      </div>
    </div>
  );
}
