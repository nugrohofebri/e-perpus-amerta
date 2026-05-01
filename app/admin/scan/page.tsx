import { AppShell } from "@/components/AppShell";
import { AdminScanner } from "@/components/AdminScanner";
import { requireAdminAccess } from "@/lib/supabase/data";

export default async function ScannerPage() {
  await requireAdminAccess();

  return (
    <AppShell mode="admin">
      <section className="mx-auto max-w-5xl">
        <div className="mb-10">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.28em] text-primary">QR Scanner</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight md:text-5xl">Scan Kartu atau Buku</h1>
          <p className="mt-3 max-w-xl text-on-surface-variant">
            Kamera aktif langsung dari browser, dengan pilihan depan atau belakang untuk penggunaan mobile.
          </p>
        </div>

        <AdminScanner />
      </section>
    </AppShell>
  );
}
