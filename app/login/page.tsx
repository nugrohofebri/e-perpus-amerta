import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { getCurrentProfile } from "@/lib/supabase/data";

export default async function LoginPage() {
  const auth = await getCurrentProfile();

  if (auth.user) {
    redirect(auth.profile?.role === "student" ? "/borrowings" : "/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <LoginForm />
    </main>
  );
}
