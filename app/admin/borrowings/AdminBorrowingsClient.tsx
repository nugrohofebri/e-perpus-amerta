"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import type { Borrowing } from "@/lib/types";

export function AdminBorrowingsClient({ initialBorrowings }: { initialBorrowings: Borrowing[] }) {
  const [filter, setFilter] = useState<"Semua" | "Aktif" | "Dikembalikan">("Semua");
  const [visibleCount, setVisibleCount] = useState(10);

  const filteredBorrowings = initialBorrowings.filter((b) => {
    if (filter === "Aktif") {
      return b.status === "Aktif" || b.status === "Menunggu" || b.status === "Terlambat";
    }
    if (filter === "Dikembalikan") {
      return b.status === "Dikembalikan";
    }
    return true; // "Semua"
  });

  const visibleBorrowings = filteredBorrowings.slice(0, visibleCount);
  const hasMore = visibleCount < filteredBorrowings.length;

  const loadMore = () => setVisibleCount((prev) => prev + 10);

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        {(["Semua", "Aktif", "Dikembalikan"] as const).map((opt) => (
          <button
            key={opt}
            onClick={() => {
              setFilter(opt);
              setVisibleCount(10);
            }}
            className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${
              filter === opt
                ? "bg-primary text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 ring-1 ring-slate-200"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-surface-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-surface-container bg-surface-container-low text-on-surface-variant">
                <th className="whitespace-nowrap px-6 py-4 font-bold">Buku & Penulis</th>
                <th className="whitespace-nowrap px-6 py-4 font-bold">Peminjam</th>
                <th className="whitespace-nowrap px-6 py-4 font-bold">Status</th>
                <th className="whitespace-nowrap px-6 py-4 font-bold">Peminjaman</th>
                <th className="whitespace-nowrap px-6 py-4 font-bold">Tenggat</th>
                <th className="whitespace-nowrap px-6 py-4 font-bold">Pengembalian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {visibleBorrowings.map((borrow) => {
                const isPending = borrow.status === "Menunggu";
                const isActive = borrow.status === "Aktif";
                const isOverdue = borrow.status === "Terlambat";
                
                let badgeColors = "bg-slate-100 text-slate-600";
                let dotColors = "bg-slate-400";
                
                if (isActive) { badgeColors = "bg-green-100 text-green-700"; dotColors = "bg-green-500"; }
                else if (isPending) { badgeColors = "bg-amber-100 text-amber-700"; dotColors = "bg-amber-500"; }
                else if (isOverdue) { badgeColors = "bg-red-100 text-red-700"; dotColors = "bg-red-500"; }
                
                return (
                  <tr key={borrow.id} className="transition hover:bg-surface-bright">
                    <td className="px-6 py-4">
                      <p className="max-w-[200px] font-bold text-on-surface line-clamp-1">{borrow.title}</p>
                      <p className="text-xs text-on-surface-variant line-clamp-1">Oleh {borrow.author}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-on-surface">{borrow.borrowerName ?? "Tidak diketahui"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${badgeColors}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${dotColors}`} />
                        {borrow.status}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{borrow.borrowDate}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-amber-700">{borrow.dueDate}</p>
                    </td>
                    <td className="px-6 py-4">
                      {borrow.status === "Dikembalikan" ? (
                        <p className="font-medium text-green-700">{borrow.returnDate}</p>
                      ) : (
                        <span className="text-xs font-bold text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              
              {visibleBorrowings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">
                    Belum ada riwayat peminjaman untuk filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {hasMore && (
           <div className="border-t border-slate-100 bg-slate-50 p-4 text-center">
             <button
               onClick={loadMore}
               className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-6 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-300"
             >
               Tampilkan Lebih Banyak
             </button>
           </div>
        )}
      </div>
    </>
  );
}
