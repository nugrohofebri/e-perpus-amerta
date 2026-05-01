"use client";

import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Icon } from "@/components/Icon";
import { createMemberAction, type MemberFormState } from "@/app/admin/members/actions";

type Props = {
  /** Role admin yang sedang login – hanya superadmin yg bisa tambah librarian/admin */
  adminRole: "admin" | "librarian";
};

export function AddMemberModal({ adminRole }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState<MemberFormState, FormData>(createMemberAction, {});

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("new=true")) {
      setOpen(true);
    }
  }, []);

  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      {/* Trigger button */}
      <button
        id="btn-tambah-anggota"
        onClick={() => setOpen(true)}
        className="flex w-fit items-center gap-2 rounded-full bg-gradient-to-br from-primary to-primary-container px-7 py-4 font-bold text-white shadow-soft transition hover:scale-105 active:scale-95"
        type="button"
      >
        <Icon name="person_add" />
        Tambah Anggota
      </button>

      {/* Backdrop */}
      {open ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal card */}
          <div className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-[2rem] bg-white p-6 md:p-8 shadow-2xl">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
                  Admin Panel
                </p>
                <h2 className="mt-1 font-headline text-2xl font-extrabold">
                  Tambah Anggota Baru
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {adminRole === "admin"
                    ? "Bisa menambah siswa, librarian, maupun admin lain."
                    : "Hanya bisa menambah akun siswa."}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container text-on-surface-variant hover:bg-error-container hover:text-error"
                type="button"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>

            {state.successData ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <Icon name="check_circle" className="text-5xl" />
                </div>
                <h3 className="font-headline text-2xl font-extrabold text-gray-900">
                  Sukses Membuat Akun
                </h3>
                <p className="mt-4 text-on-surface-variant leading-relaxed">
                  Akun atas nama <strong className="text-gray-900">{state.successData.name}</strong> 
                  <br />dengan email <strong className="text-gray-900">{state.successData.email}</strong>
                  <br />telah berhasil ditambahkan.
                </p>
                <div className="mt-8 flex w-full gap-3">
                  <button
                    onClick={() => {
                      handleClose();
                      window.location.reload(); // Reload to reset state and form
                    }}
                    className="flex flex-1 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-container px-6 py-3.5 font-bold text-white shadow-soft transition hover:scale-105 active:scale-95"
                    type="button"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <form action={formAction} className="space-y-4">
              {/* Nama lengkap */}
              <label className="block">
                <span className="ml-1 text-[11px] font-bold uppercase tracking-widest text-primary">
                  Nama Lengkap <span className="text-error">*</span>
                </span>
                <input
                  className="mt-2 w-full rounded-xl border-0 bg-surface-container-high px-4 py-3.5 focus:ring-2 focus:ring-primary/20"
                  name="full_name"
                  placeholder="Masukkan nama lengkap"
                  required
                  type="text"
                />
              </label>

              {/* Email */}
              <label className="block">
                <span className="ml-1 text-[11px] font-bold uppercase tracking-widest text-primary">
                  Email <span className="text-error">*</span>
                </span>
                <input
                  className="mt-2 w-full rounded-xl border-0 bg-surface-container-high px-4 py-3.5 focus:ring-2 focus:ring-primary/20"
                  name="email"
                  placeholder="nama@sekolah.id"
                  required
                  type="email"
                />
              </label>

              {/* Password */}
              <label className="block">
                <span className="ml-1 text-[11px] font-bold uppercase tracking-widest text-primary">
                  Password <span className="text-error">*</span>
                </span>
                <input
                  className="mt-2 w-full rounded-xl border-0 bg-surface-container-high px-4 py-3.5 focus:ring-2 focus:ring-primary/20"
                  name="password"
                  placeholder="Minimal 6 karakter"
                  required
                  type="password"
                  minLength={6}
                />
              </label>

              {/* Role */}
              <label className="block">
                <span className="ml-1 text-[11px] font-bold uppercase tracking-widest text-primary">
                  Role
                </span>
                <select
                  className="mt-2 w-full rounded-xl border-0 bg-surface-container-high px-4 py-3.5 focus:ring-2 focus:ring-primary/20"
                  name="role"
                  defaultValue="student"
                >
                  <option value="student">Siswa</option>
                  <option value="teacher">Guru</option>
                  {adminRole === "admin" ? (
                    <>
                      <option value="librarian">Pustakawan</option>
                      <option value="admin">Admin</option>
                    </>
                  ) : null}
                </select>
              </label>

              {/* Status messages */}
              {state.error ? (
                <p className="rounded-xl bg-error-container/20 p-3 text-sm text-error">
                  {state.error}
                </p>
              ) : null}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleClose}
                  className="flex-1 rounded-full bg-surface-container px-6 py-3.5 font-bold text-on-surface transition hover:bg-surface-container-high"
                  type="button"
                >
                  Batal
                </button>
                <SubmitButton />
              </div>
            </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-br from-primary to-primary-container px-6 py-3.5 font-bold text-white disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      <Icon name={pending ? "hourglass_empty" : "person_add"} />
      {pending ? "Menyimpan..." : "Simpan"}
    </button>
  );
}
