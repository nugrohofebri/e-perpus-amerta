import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 w-full rounded-t-[2.5rem] border-t border-surface-container-low bg-white px-6 py-10 shadow-sm md:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        
        {/* Identitas Sekolah / Web */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/logo.png" 
              alt="Logo E-Perpus Amerta" 
              className="h-10 w-10 object-contain drop-shadow-sm"
            />
            <h2 className="font-headline text-xl font-extrabold tracking-tight text-slate-800">
              E-Perpus Amerta
            </h2>
          </div>
          <p className="max-w-xs text-sm font-medium text-slate-500 leading-relaxed">
            Membangun masa depan generasi agroteknologi lewat kemudahan literasi digital tanpa batas.
          </p>
        </div>

        {/* Link / Copyright */}
        <div className="flex flex-col gap-3 text-left md:text-right">
          <p className="text-[13px] font-bold text-slate-400">
            &copy; 2026 Hak Cipta Dilindungi
          </p>
          <p className="text-[13px] font-bold text-slate-500">
            Platform dikembangkan oleh{" "}
            <a 
              href="#" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline hover:text-primary-container font-extrabold tracking-wide transition"
            >
              Upscale Digital Lab
            </a>
          </p>
        </div>

      </div>
    </footer>
  );
}
