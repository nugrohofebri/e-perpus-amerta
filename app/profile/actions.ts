"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ChangePasswordState = {
  error?: string;
  success?: string;
};

export async function changePasswordAction(
  _: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const supabase = createClient();
  if (!supabase) return { error: "Database tidak tersedia." };

  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!newPassword || newPassword.length < 6) {
    return { error: "Password minimal 6 karakter." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Konfirmasi password tidak cocok." };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) return { error: error.message };

  revalidatePath("/profile");
  return { success: "Password berhasil diperbarui!" };
}
