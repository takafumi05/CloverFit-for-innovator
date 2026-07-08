import type { ReactNode } from "react";
import { statusLabel } from "@/lib/format";

const BADGE: Record<string, string> = {
  new: "bg-green-tint text-green-dark",
  contacted: "bg-[#eaf1fb] text-[#2563eb]",
  scheduled: "bg-[#fdf3e3] text-[#b45309]",
  completed: "bg-[#e9f8ee] text-[#15803d]",
  cancelled: "bg-[#fdeaea] text-[#dc2626]",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] font-inter text-[11px] font-semibold tracking-[0.03em] ${
        BADGE[status] || "bg-surface text-muted"
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {statusLabel(status)}
    </span>
  );
}

export function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-white border border-line rounded-[8px] px-5 py-5 shadow-[0_1px_3px_rgba(20,32,26,0.04)]">
      <span className="font-inter text-[10px] font-semibold tracking-[0.14em] text-muted uppercase block mb-2.5">
        {label}
      </span>
      <span
        className={`font-inter font-extrabold text-[28px] leading-none tracking-[-0.02em] block ${
          accent ? "text-green" : "text-ink"
        }`}
      >
        {value}
      </span>
      {sub && <span className="mt-1.5 block text-[12px] text-muted">{sub}</span>}
    </div>
  );
}

export function Panel({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-line rounded-[8px] shadow-[0_1px_3px_rgba(20,32,26,0.04)] ${className}`}
    >
      {title && (
        <div className="px-5 py-3.5 border-b border-line">
          <span className="font-sans font-bold text-[14px] text-ink">
            {title}
          </span>
        </div>
      )}
      {children}
    </div>
  );
}
