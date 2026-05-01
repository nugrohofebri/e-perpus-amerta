"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Icon } from "@/components/Icon";
import { signInAction } from "@/app/login/actions";
import type { AuthFormState } from "@/app/login/actions";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInState, signInFormAction] = useFormState<AuthFormState, FormData>(signInAction, {});

  return (
    <div className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-ambient">
      {/* Brand mark */}
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-container text-white">
        <Icon name="local_library" className="text-2xl" />
      </div>

      <h2 className="font-headline text-2xl font-extrabold">Masuk ke E-Perpus</h2>
      <p className="mt-2 text-sm leading-6 text-on-surface-variant">
        Masukkan email dan password akun yang sudah didaftarkan oleh admin perpustakaan.
      </p>

      <form className="mt-8 space-y-5" action={signInFormAction}>
        <label className="block">
          <span className="ml-1 text-[11px] font-bold uppercase tracking-widest text-primary">Email</span>
          <input
            className="mt-2 w-full rounded-xl border-0 bg-surface-container-high px-4 py-3.5 focus:ring-2 focus:ring-primary/20"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@sekolah.id"
            required
            type="email"
            value={email}
          />
        </label>

        <label className="block">
          <span className="ml-1 text-[11px] font-bold uppercase tracking-widest text-primary">Password</span>
          <input
            className="mt-2 w-full rounded-xl border-0 bg-surface-container-high px-4 py-3.5 focus:ring-2 focus:ring-primary/20"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Masukkan password"
            required
            type="password"
            value={password}
          />
        </label>

        {signInState?.error ? (
          <p className="rounded-xl bg-error-container/20 p-3 text-sm text-error">{signInState.error}</p>
        ) : null}

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-xs text-on-surface-variant">
        Belum punya akun?{" "}
        <span className="font-bold text-primary">Hubungi admin perpustakaan</span> untuk didaftarkan.
      </p>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-primary to-primary-container px-6 py-4 font-bold text-white disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      <Icon name="login" />
      {pending ? "Memproses..." : "Masuk"}
    </button>
  );
}

