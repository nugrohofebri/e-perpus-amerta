"use client";

import { useState, useCallback } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { CoverUploader } from "@/components/CoverUploader";
import { createBookAction, editBookAction, type BookFormState } from "@/app/admin/books/new/actions";

function toTitleCase(str: string): string {
  return str.replace(/\S+/g, (word) =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
}

export function AdminBookForm({ initialData }: { initialData?: any }) {
  const isEdit = Boolean(initialData);
  const actionToUse = isEdit ? editBookAction.bind(null, initialData.id) : createBookAction;
  const [state, formAction] = useFormState<BookFormState, FormData>(actionToUse as any, {});

  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>(initialData?.title ?? "");
  const [author, setAuthor] = useState<string>(initialData?.author ?? "");

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const cursor = e.target.selectionStart;
    const formatted = toTitleCase(e.target.value);
    setTitle(formatted);
    // Kembalikan posisi cursor agar tidak loncat ke ujung
    requestAnimationFrame(() => {
      e.target.setSelectionRange(cursor, cursor);
    });
  }, []);

  const handleAuthorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const cursor = e.target.selectionStart;
    const formatted = toTitleCase(e.target.value);
    setAuthor(formatted);
    requestAnimationFrame(() => {
      e.target.setSelectionRange(cursor, cursor);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (compressedFile) {
      formData.set("cover_image", compressedFile);
    }
    formAction(formData);
  };

  if (state?.success) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 rounded-[3rem] bg-white p-12 text-center shadow-sm">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600">
          <Icon name="check_circle" className="text-6xl" />
        </div>
        <div>
          <h2 className="font-headline text-3xl font-extrabold text-slate-900">Selesai!</h2>
          <p className="mt-3 text-lg font-medium text-slate-600">{state.success}</p>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href="/admin/catalog"
            className="rounded-full bg-surface-container px-8 py-3.5 font-bold text-primary transition hover:bg-surface-container-high"
          >
            Lihat Katalog
          </Link>
          {!isEdit && (
            <button
              onClick={() => window.location.reload()}
              className="rounded-full bg-primary px-8 py-3.5 font-bold text-white transition hover:bg-primary/90"
            >
              Tambah Buku Lagi
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <section>
        <CoverUploader 
          initialPreview={initialData?.coverUrl}
          onFileProcessed={(file) => setCompressedFile(file)}
        />
      </section>

      <section className="rounded-[2rem] bg-white p-7 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Judul Buku — auto title case */}
          <label className="sm:col-span-2">
            <span className="ml-1 text-[11px] font-bold uppercase tracking-widest text-primary">Judul Buku</span>
            <input
              value={title}
              onChange={handleTitleChange}
              className="mt-2 w-full rounded-xl border-0 bg-surface-container-high px-4 py-3.5 font-medium focus:ring-2 focus:ring-primary/20"
              name="title"
              placeholder="Masukkan judul buku"
              type="text"
            />
          </label>

          {/* Nama Penulis — auto title case */}
          <label>
            <span className="ml-1 text-[11px] font-bold uppercase tracking-widest text-primary">Nama Penulis</span>
            <input
              value={author}
              onChange={handleAuthorChange}
              className="mt-2 w-full rounded-xl border-0 bg-surface-container-high px-4 py-3.5 font-medium focus:ring-2 focus:ring-primary/20"
              name="author"
              placeholder="Contoh: Andrea Hirata"
              type="text"
            />
          </label>

          {/* ISBN — uncontrolled */}
          <label>
            <span className="ml-1 text-[11px] font-bold uppercase tracking-widest text-primary">ISBN</span>
            <input
              defaultValue={initialData?.isbn ?? ""}
              className="mt-2 w-full rounded-xl border-0 bg-surface-container-high px-4 py-3.5 font-medium focus:ring-2 focus:ring-primary/20"
              name="isbn"
              placeholder="978-0000000000"
              type="text"
            />
          </label>

          <label>
            <span className="ml-1 text-[11px] font-bold uppercase tracking-widest text-primary">Kategori</span>
            <select
              className="mt-2 w-full rounded-xl border-0 bg-surface-container-high px-4 py-3.5 font-medium focus:ring-2 focus:ring-primary/20"
              name="category"
              defaultValue={initialData?.category ?? ""}
            >
              <option value="" disabled>
                Pilih kategori...
              </option>
              <optgroup label="Fiksi">
                <option value="Novel">Novel</option>
                <option value="Cerpen">Cerpen</option>
                <option value="Puisi">Puisi</option>
              </optgroup>
              <optgroup label="Hobi & Hiburan">
                <option value="Komik">Komik</option>
                <option value="Musik">Musik</option>
                <option value="Olahraga">Olahraga</option>
                <option value="Kerajinan Tangan">Kerajinan Tangan</option>
              </optgroup>
              <optgroup label="Tokoh">
                <option value="Biografi">Biografi</option>
                <option value="Otobiografi">Otobiografi</option>
                <option value="Memoar">Memoar</option>
              </optgroup>
              <optgroup label="Sosial Politik">
                <option value="Hukum">Hukum</option>
                <option value="Politik">Politik</option>
                <option value="Kewarganegaraan">Kewarganegaraan</option>
                <option value="Ekonomi">Ekonomi</option>
              </optgroup>
              <optgroup label="Sains & Alam">
                <option value="Lingkungan">Lingkungan</option>
                <option value="Flora & Fauna">Flora & Fauna</option>
                <option value="Antariksa">Antariksa</option>
              </optgroup>
              <optgroup label="Kesehatan">
                <option value="Gizi">Gizi</option>
                <option value="Penyakit">Penyakit</option>
                <option value="Olahraga Kesehatan">Olahraga Kesehatan</option>
              </optgroup>
              <optgroup label="Religi">
                <option value="Kitab Suci">Kitab Suci</option>
                <option value="Sejarah Agama">Sejarah Agama</option>
                <option value="Doa-doa">Doa-doa</option>
              </optgroup>
              <optgroup label="Referensi">
                <option value="Kamus">Kamus</option>
                <option value="Ensiklopedia">Ensiklopedia</option>
                <option value="Atlas">Atlas</option>
              </optgroup>
              <optgroup label="Lainnya">
                <option value="Buku Pelajaran">Buku Pelajaran</option>
                <option value="Umum">Umum</option>
              </optgroup>
            </select>
          </label>

          <label>
            <span className="ml-1 text-[11px] font-bold uppercase tracking-widest text-primary">Stok</span>
            <input
              className="mt-2 w-full rounded-xl border-0 bg-surface-container-high px-4 py-3.5 font-medium focus:ring-2 focus:ring-primary/20"
              defaultValue={initialData?.total_copies ?? 1}
              min="0"
              name="total_copies"
              type="number"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="ml-1 text-[11px] font-bold uppercase tracking-widest text-primary">Deskripsi</span>
            <textarea
              className="mt-2 min-h-32 w-full rounded-xl border-0 bg-surface-container-high px-4 py-3.5 font-medium focus:ring-2 focus:ring-primary/20"
              name="description"
              defaultValue={initialData?.description ?? ""}
              placeholder="Tulis ringkasan buku..."
            />
          </label>
        </div>

        {state?.error && (
          <div className="col-span-full mt-6 rounded-xl bg-error-container p-4 text-sm font-bold text-error">
            {state.error}
          </div>
        )}

        <div className="col-span-full mt-8 flex items-center justify-end gap-3">
          <SubmitButton isEdit={isEdit} />
        </div>
      </section>
    </form>
  );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();

  return (
    <>
      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center gap-5 rounded-[2.5rem] bg-white p-10 shadow-2xl">
            <Icon name="autorenew" className="animate-spin text-5xl text-primary" />
            <p className="font-headline text-lg font-bold text-slate-800">Menyimpan data...</p>
          </div>
        </div>
      )}
      <button
        className="flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-soft transition hover:bg-primary/90 active:scale-95 disabled:opacity-50"
        disabled={pending}
        type="submit"
      >
        <Icon name="save" className="text-lg" />
        {isEdit ? "Perbarui Buku" : "Simpan Buku"}
      </button>
    </>
  );
}
