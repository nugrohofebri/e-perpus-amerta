"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Icon } from "@/components/Icon";
import { createBookAction, editBookAction, type BookFormState } from "@/app/admin/books/new/actions";

const fields = [
  ["title", "Judul Buku", "Masukkan judul buku"],
  ["author", "Nama Penulis", "Contoh: Andrea Hirata"],
  ["isbn", "ISBN", "978-0000000000"]
] as const;

export function AdminBookForm({ initialData }: { initialData?: any }) {
  const isEdit = Boolean(initialData);
  const actionToUse = isEdit ? editBookAction.bind(null, initialData.id) : createBookAction;
  const [state, formAction] = useFormState<BookFormState, FormData>(actionToUse as any, {});
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.coverUrl || null);

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <section>
        <label className="group relative flex aspect-[3/4] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-outline-variant/30 bg-surface-container-high text-center transition hover:border-primary hover:bg-surface-container">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Cover Preview" className="h-full w-full object-cover" />
          ) : (
            <>
              <Icon name="add_photo_alternate" className="mb-3 text-4xl text-outline group-hover:text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-outline group-hover:text-primary">
                Upload Cover
              </span>
              <span className="mt-2 text-[10px] text-outline-variant">Max 2MB (Opsional)</span>
            </>
          )}
          <input
            type="file"
            name="cover_image"
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPreviewUrl(URL.createObjectURL(file));
              else setPreviewUrl(null);
            }}
          />
        </label>
        <p className="mt-4 text-sm leading-6 text-on-surface-variant">
          Buku akan langsung tersimpan ke Supabase. Jika tidak ada gambar, bisa dikosongkan.
        </p>
      </section>

      <section className="rounded-[2rem] bg-white p-7 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          {fields.map(([name, label, placeholder]) => (
            <label key={name} className={name === "title" ? "sm:col-span-2" : ""}>
              <span className="ml-1 text-[11px] font-bold uppercase tracking-widest text-primary">{label}</span>
              <input
                defaultValue={initialData?.[name] ?? ""}
                className="mt-2 w-full rounded-xl border-0 bg-surface-container-high px-4 py-3.5 font-medium focus:ring-2 focus:ring-primary/20"
                name={name}
                placeholder={placeholder}
                type="text"
              />
            </label>
          ))}

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
        {state.success ? <p className="mt-6 rounded-xl bg-green-100 p-3 text-sm text-green-700">{state.success}</p> : null}

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
    <button
      className="flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-soft transition hover:bg-primary/90 active:scale-95 disabled:opacity-50"
      disabled={pending}
      type="submit"
    >
      <Icon name="save" />
      {pending ? "Menyimpan..." : isEdit ? "Perbarui Buku" : "Simpan Buku"}
    </button>
  );
}
