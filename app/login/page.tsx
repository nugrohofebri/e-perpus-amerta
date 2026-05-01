import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { getCurrentProfile } from "@/lib/supabase/data";

export default async function LoginPage() {
  const auth = await getCurrentProfile();

  if (auth.user) {
    redirect(auth.profile?.role === "student" ? "/borrowings" : "/admin");
  }

  return (
    <main className="grid min-h-screen bg-surface md:grid-cols-[1fr_0.85fr]">
      <section className="flex flex-col justify-between px-6 py-8 md:px-12">
        <div className="font-headline text-xl font-extrabold tracking-tight text-primary">E-Perpus Amerta</div>
        <div className="max-w-2xl py-16">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.28em] text-primary">Supabase Auth</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight md:text-6xl">
            Masuk ke e-perpus sekolah.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-on-surface-variant">
            Gunakan email dan password yang diberikan oleh sekolah.
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center bg-surface-container-low px-6 py-10">
        <LoginForm />
      </section>
    </main>
  );
}
