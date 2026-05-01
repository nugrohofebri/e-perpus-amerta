import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { getCurrentProfile } from "@/lib/supabase/data";
import { signOutAction } from "@/app/login/actions";
import { ChangePasswordButton } from "./ChangePasswordForm";

export default async function ProfilePage() {
  const auth = await getCurrentProfile();

  if (!auth.user) {
    redirect("/login");
  }

  const profile = auth.profile;

  return (
    <AppShell>
      <section className="mb-8">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.28em] text-primary">
          Akun Saya
        </p>
        <h1 className="font-headline text-4xl font-extrabold tracking-tight md:text-5xl">Profil</h1>
      </section>

      <div className="mx-auto max-w-2xl space-y-6">

        {/* Kartu Anggota */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-primary-container p-8 text-white shadow-xl">
          {/* Decorative circles */}
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 right-20 h-24 w-24 rounded-full bg-white/10" />

          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">
              Kartu Anggota Perpustakaan
            </p>
            <p className="text-[10px] font-bold text-white/60 mt-0.5">SMK Amerta E-Perpus</p>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-extrabold">
                {(profile?.fullName ?? "U").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h2 className="font-headline text-2xl font-extrabold leading-tight">
                  {profile?.fullName ?? "Pengguna"}
                </h2>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-white/10 px-5 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">ID Anggota</p>
              <p className="mt-1 font-mono text-lg font-extrabold tracking-[0.18em]">
                {profile?.memberCode ?? "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Info Akun */}
        <div className="rounded-[2rem] bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-headline text-lg font-extrabold text-slate-800">Info Akun</h3>
          <div className="space-y-3">
            {[
              { icon: "person", label: "Nama Lengkap", value: profile?.fullName ?? "-" },
              { icon: "email", label: "Email", value: auth.user.email ?? "-" },
              { icon: "event", label: "Mulai Bergabung", value: auth.user.created_at ? new Date(auth.user.created_at).toLocaleDateString("id-ID", { month: "long", year: "numeric" }) : "-" },
              { icon: "badge", label: "ID Anggota", value: profile?.memberCode ?? "-" },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary">
                  <Icon name={icon} className="text-[18px]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
                  <p className="mt-0.5 truncate text-sm font-bold text-slate-700">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <ChangePasswordButton />

          {/* Logout */}
          <div className="rounded-2xl bg-white p-2 shadow-sm">
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex w-full items-center justify-between rounded-xl bg-error-container/50 px-5 py-4 text-sm font-bold text-error transition hover:bg-error hover:text-white active:scale-95"
              >
                <span className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/50 text-error">
                    <Icon name="logout" className="text-[18px]" />
                  </div>
                  Keluar dari Akun
                </span>
                <Icon name="chevron_right" className="text-error/50" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
