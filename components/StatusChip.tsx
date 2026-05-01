import clsx from "clsx";
import type { ReactNode } from "react";

type StatusChipProps = {
  children: ReactNode;
  tone?: "success" | "pending" | "danger" | "neutral";
};

export function StatusChip({ children, tone = "neutral" }: StatusChipProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
        tone === "success" && "bg-green-100 text-green-700",
        tone === "pending" && "bg-tertiary-container text-tertiary",
        tone === "danger" && "bg-error-container text-error",
        tone === "neutral" && "bg-surface-container-high text-on-surface-variant"
      )}
    >
      {children}
    </span>
  );
}
