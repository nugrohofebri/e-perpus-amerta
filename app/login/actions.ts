"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
  success?: string;
};

export async function signInAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const supabase = createClient();

  if (!supabase) {
    return { error: "Isi env Supabase dulu di .env.local untuk memakai auth nyata." };
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect("/admin");
}

export async function signUpAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const supabase = createClient();

  if (!supabase) {
    return { error: "Isi env Supabase dulu di .env.local untuk memakai auth nyata." };
  }

  const fullName = String(formData.get("full_name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
      data: {
        full_name: fullName
      }
    }
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: "Akun berhasil dibuat. Cek email kalau konfirmasi email diaktifkan."
  };
}

export async function signOutAction() {
  const supabase = createClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/login");
}
