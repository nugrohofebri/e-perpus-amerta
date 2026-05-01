import clsx from "clsx";

type BookCoverProps = {
  title: string;
  author: string;
  tone?: "blue" | "warm";
  coverUrl?: string | null;
  className?: string;
};

export function BookCover({ title, author, tone = "blue", coverUrl, className }: BookCoverProps) {
  if (coverUrl) {
    return (
      <div className={clsx("overflow-hidden rounded-xl bg-surface-container shadow-ambient", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coverUrl} alt={`Cover ${title}`} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-xl p-5 text-white shadow-ambient",
        tone === "blue" ? "book-cover" : "book-cover-warm",
        className
      )}
    >
      <div className="absolute -right-12 -top-10 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
      <div className="relative z-10 text-[10px] font-bold uppercase tracking-[0.24em] text-white/80">
        Amerta
      </div>
      <div className="relative z-10">
        <h4 className="font-headline text-xl font-extrabold leading-tight tracking-tight">{title}</h4>
        <p className="mt-3 text-xs font-semibold text-white/80">{author}</p>
      </div>
    </div>
  );
}
