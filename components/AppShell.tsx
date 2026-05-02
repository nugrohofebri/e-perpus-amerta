import Link from "next/link";
import type { ReactNode } from "react";
import { signOutAction } from "@/app/login/actions";
import { Icon } from "@/components/Icon";
import { Footer } from "@/components/Footer";
import { getCurrentProfile } from "@/lib/supabase/data";

const adminLinks = [
  { href: "/admin", label: "Overview", icon: "dashboard" },
  { href: "/admin/catalog", label: "Katalog", icon: "library_books" },
  { href: "/admin/scan", label: "Scan QR", icon: "qr_code_scanner" },
  { href: "/admin/borrowings", label: "Peminjaman", icon: "history_edu" },
  { href: "/admin/members", label: "Anggota", icon: "group" }
];

type AppShellProps = {
  children: ReactNode;
  mode?: "student" | "admin";
};

export async function AppShell({ children, mode = "student" }: AppShellProps) {
  const auth = await getCurrentProfile();
  
  const userRole = auth.profile?.role;
  const isStaff = userRole === "admin" || userRole === "superadmin" || userRole === "librarian";

  const studentLinks = [
    { href: "/", label: "Dashboard", icon: "dashboard" },
    { href: "/catalog", label: "Katalog", icon: "library_books" },
    { href: "/borrowings", label: "Peminjaman", icon: "history_edu" },
    { href: "/saved", label: "Tersimpan", icon: "bookmark" },
    auth.user 
      ? (isStaff ? { href: "/admin", label: "Admin", icon: "admin_panel_settings" } : { href: "/profile", label: "Profil", icon: "person" })
      : { href: "/login", label: "Masuk", icon: "login" }
  ];

  const links = mode === "admin" ? adminLinks : studentLinks;
  
  const subtitle = isStaff
    ? (userRole === "admin" || userRole === "superadmin" ? "Super Admin" : "Librarian")
    : (auth.user ? "Student Portal" : "Visitor");

  const profileName = auth.profile?.fullName ?? (mode === "admin" ? "Mode Demo Admin" : "Mode Demo Siswa");
  const footerText = auth.user
    ? `${userRole ?? "user"} · ${auth.user.email}`
    : "Auth, database, dan RLS siap dipakai saat env diisi.";

  return (
    <div className={`min-h-screen bg-surface text-on-surface`}>
      {/* ── Header Khusus Tamu ── */}
      {!auth.user && (
        <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-surface-container-low bg-white px-6 py-4 md:px-10">
          <Link href="/" className="font-headline text-xl font-extrabold tracking-tight text-primary">
            E-Perpus Amerta
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-surface-container"
          >
            <Icon name="login" className="text-[18px]" />
            Masuk
          </Link>
        </header>
      )}

      {/* Sidebar secara permanen dihapus agar layout menjadi Bottom Nav semua */}

      {/* ── Header Atas Global (Menampilkan Logo Web) ── */}
      {auth.user && (
        <header className="glass sticky top-0 z-50 flex w-full items-center justify-between px-5 py-4 shadow-sm md:px-10">
          <Link href={mode === "admin" ? "/admin" : "/"} className="flex items-center gap-2 font-headline text-lg font-extrabold tracking-tight text-primary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo" className="h-7 w-7 object-contain mix-blend-multiply" />
            E-Perpus Amerta
          </Link>
          {mode === "admin" && (
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex items-center rounded-full p-2 text-error transition hover:bg-error-container"
                title="Keluar (Admin)"
              >
                <Icon name="logout" className="text-[20px]" />
              </button>
            </form>
          )}
        </header>
      )}

      <main className="mx-auto flex min-h-[85vh] w-full max-w-7xl flex-col px-5 py-8 pb-36 md:px-8 md:pt-10 md:pb-36">
        <div className="flex-1">{children}</div>
        <Footer />
      </main>

      {/* ── Bottom Nav General ── */}
      {auth.user && (
        <nav className="glass fixed bottom-0 left-0 z-50 flex w-full items-center justify-evenly border-t border-slate-200/50 px-2 py-2 shadow-[0_-8px_30px_-5px_rgba(0,0,0,0.1)]">
        {links.map((link) => {
          if (link.href === "/admin/scan") {
            return (
              <div key={link.href} className="relative -top-5 flex justify-center">
                <Link
                  href={link.href}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-container text-white shadow-lg shadow-primary/30 transition hover:scale-105 active:scale-95"
                >
                  <Icon name={link.icon} className="text-2xl" />
                </Link>
              </div>
            );
          }
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex w-16 flex-col items-center gap-1 rounded-2xl p-1 text-[10px] font-bold text-on-surface-variant hover:bg-white hover:text-primary active:bg-surface-container"
            >
              <Icon name={link.icon} className="text-[20px]" />
              <span className="w-full truncate text-center">{link.label.split(" ")[0]}</span>
            </Link>
          );
        })}
        </nav>
      )}
    </div>
  );
}
