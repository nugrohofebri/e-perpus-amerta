"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { changePasswordAction, type ChangePasswordState } from "./actions";
import { Icon } from "@/components/Icon";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-primary py-3.5 text-sm font-bold text-white transition hover:bg-primary/90 active:scale-95 disabled:opacity-60"
    >
      {pending ? "Menyimpan..." : "Perbarui Password"}
    </button>
  );
}

function PasswordModal({ onClose }: { onClose: () => void }) {
  const [state, formAction] = useFormState<ChangePasswordState, FormData>(
    changePasswordAction,
    {}
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-[2rem] bg-white p-7 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-primary">
              <Icon name="lock" className="text-[18px]" />
            </div>
            <h3 className="font-headline text-lg font-extrabold text-slate-800">Ganti Password</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
            <Icon name="close" className="text-xl" />
          </button>
        </div>

        {state.success ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Icon name="check_circle" className="text-3xl" />
            </div>
            <p className="font-bold text-slate-800">Password Berhasil Diperbarui!</p>
            <button
              onClick={onClose}
              className="mt-5 w-full rounded-full bg-primary py-3 text-sm font-bold text-white"
            >
              Tutup
            </button>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">Password Baru</label>
              <input
                name="newPassword"
                type="password"
                required
                minLength={6}
                placeholder="Minimal 6 karakter"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">Konfirmasi Password</label>
              <input
                name="confirmPassword"
                type="password"
                required
                placeholder="Ulangi password baru"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {state.error && (
              <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                <Icon name="error" className="text-base shrink-0" />
                {state.error}
              </div>
            )}

            <SubmitButton />
          </form>
        )}
      </div>
    </div>
  );
}

export function ChangePasswordButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-5 py-4 text-sm font-bold text-slate-700 transition hover:bg-primary-container hover:text-primary"
      >
        <span className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container text-primary">
            <Icon name="lock" className="text-[18px]" />
          </div>
          Ganti Password
        </span>
        <Icon name="chevron_right" className="text-slate-400" />
      </button>

      {open && <PasswordModal onClose={() => setOpen(false)} />}
    </>
  );
}
