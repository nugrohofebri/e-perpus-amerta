"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createClient as createStandardClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";

export type MemberFormState = {
  error?: string;
  successData?: { name: string; email: string; role: string; password?: string };
};

export async function createMemberAction(
  _: MemberFormState,
  formData: FormData
): Promise<MemberFormState> {
  const supabase = createClient();

  if (!supabase) {
    return { error: "Supabase belum aktif. Isi .env.local dulu." };
  }

  // Verify admin/librarian
  const {
    data: { user: adminUser }
  } = await supabase.auth.getUser();

  if (!adminUser) {
    return { error: "Sesi login tidak ditemukan. Silakan login ulang." };
  }

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", adminUser.id)
    .single<{ role: string }>();

  if (!adminProfile || !["admin", "librarian"].includes(adminProfile.role)) {
    return { error: "Hanya admin atau pustakawan yang boleh menambah anggota." };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const role = String(formData.get("role") ?? "student") as "student" | "teacher" | "librarian" | "admin";

  if (!fullName || !email || !password) {
    return { error: "Nama, email, dan password wajib diisi." };
  }

  if (password.length < 6) {
    return { error: "Password minimal 6 karakter." };
  }

  // Only superadmin (role=admin) can create librarian/admin accounts
  if ((role === "librarian" || role === "admin") && adminProfile.role !== "admin") {
    return { error: "Hanya Super Admin yang boleh menambah akun librarian atau admin." };
  }

  // Create auth user via Supabase JS default client isolated mode to prevent hijacking the admin's session
  const env = getSupabaseEnv();
  const isolatedSupabase = createStandardClient(env.url!, env.clientKey!, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data: newUser, error: signUpError } = await isolatedSupabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  });

  if (signUpError || !newUser.user) {
    return { error: signUpError?.message ?? "Gagal membuat akun." };
  }

  // Generate Automatic Member Code
  const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
  let rolePrefix = "SW";
  if (role === "teacher") rolePrefix = "GR";
  if (role === "admin") rolePrefix = "ADM";
  if (role === "librarian") rolePrefix = "PST";
  const finalMemberCode = `AMT-${rolePrefix}-${randomStr}`;

  // Update profile with correct role (karena trigger sudah melakukan insert)
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      role,
      member_code: finalMemberCode
    })
    .eq("id", newUser.user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  revalidatePath("/admin/members");

  return {
    successData: {
      name: fullName,
      email: email,
      role: role
    }
  };
}

export async function deleteMemberAction(memberId: string) {
  const supabase = createClient();
  if (!supabase) return { error: "Supabase belum aktif." };

  const { data: adminUser } = await supabase.auth.getUser();
  if (!adminUser.user) return { error: "Sesi login tidak ditemukan." };

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", adminUser.user.id)
    .single<{ role: string }>();

  // Only superadmin can delete members completely
  if (!adminProfile || adminProfile.role !== "admin") {
    return { error: "Akses ditolak. Hanya Super Admin yang berhak menghapus akun." };
  }

  // Supabase's auth.users table is shielded. We call an internal RPC function
  // to completely delete the user from auth.users (which will cascade to profiles)
  const { error } = await supabase.rpc("delete_user", { user_id: memberId });

  if (error) return { error: error.message };

  revalidatePath("/admin/members");
  return { success: true };
}

export async function updateMemberRoleAction(memberId: string, newRole: "student" | "teacher" | "librarian" | "admin") {
  const supabase = createClient();
  if (!supabase) return { error: "Supabase belum aktif." };

  const { data: adminUser } = await supabase.auth.getUser();
  if (!adminUser.user) return { error: "Sesi login tidak ditemukan." };

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", adminUser.user.id)
    .single<{ role: string }>();

  // Use the same rules as creation
  if ((newRole === "librarian" || newRole === "admin") && adminProfile?.role !== "admin") {
    return { error: "Akses ditolak. Hanya Super Admin yang bisa mengubah menjadi Librarian/Admin." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", memberId);

  if (error) return { error: error.message };

  revalidatePath("/admin/members");
  return { success: true };
}

export async function resetUserPasswordAction(memberId: string, newPassword: string) {
  const supabase = createClient();
  if (!supabase) return { error: "Supabase belum aktif." };

  if (newPassword.length < 6) return { error: "Password minimal 6 karakter." };

  const { data: adminUser } = await supabase.auth.getUser();
  if (!adminUser.user) return { error: "Sesi login tidak ditemukan." };

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", adminUser.user.id)
    .single<{ role: string }>();

  // Only admin and librarian can reset passwords
  if (!adminProfile || !["admin", "librarian"].includes(adminProfile.role)) {
    return { error: "Akses ditolak. Hanya petugas yang bisa mereset password." };
  }

  // We use an RPC since we don't have the service_role key to hit Supabase Admin Auth API directly
  const { error } = await supabase.rpc("update_user_password", {
    user_id: memberId,
    new_password: newPassword
  });

  if (error) return { error: error.message };

  return { success: true };
}
