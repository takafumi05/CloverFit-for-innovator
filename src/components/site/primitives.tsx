import type { AnchorHTMLAttributes, ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-[1120px] mx-auto px-6 md:px-10 ${className}`}>
      {children}
    </div>
  );
}

export function Section({
  id,
  surface = false,
  className = "",
  children,
}: {
  id?: string;
  surface?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`py-20 md:py-28 ${surface ? "bg-surface" : "bg-bg"} ${className}`}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block font-inter text-[11px] font-semibold tracking-[0.2em] uppercase text-green">
      {children}
    </span>
  );
}

export function BigEn({
  children,
  center = false,
}: {
  children: string;
  center?: boolean;
}) {
  return (
    <p
      className={`font-inter font-extrabold leading-[0.95] tracking-[-0.02em] text-[clamp(30px,5.2vw,54px)] text-ink ${
        center ? "text-center" : ""
      }`}
    >
      <span className="text-green">{children.charAt(0)}</span>
      {children.slice(1)}
    </p>
  );
}

export function SectionHead({
  en,
  title,
  lead,
  center = false,
  className = "",
}: {
  en: string;
  title?: ReactNode;
  lead?: ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`${center ? "text-center mx-auto" : ""} max-w-[820px] ${className}`}
    >
      <BigEn center={center}>{en}</BigEn>
      {title && (
        <h2 className="mt-4 font-sans font-bold text-[clamp(19px,2.5vw,28px)] leading-[1.45] tracking-[-0.01em] text-ink">
          {title}
        </h2>
      )}
      {lead && (
        <p className="mt-5 text-[15px] md:text-[16px] leading-[1.95] text-muted">
          {lead}
        </p>
      )}
    </div>
  );
}

type ButtonProps = {
  href: string;
  variant?: "primary" | "secondary";
  children: ReactNode;
  className?: string;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

export function Button({
  href,
  variant = "primary",
  children,
  className = "",
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-sans font-bold text-[15px] px-7 py-3.5 rounded-[3px] transition-all duration-200 no-underline";
  const styles =
    variant === "primary"
      ? "bg-green text-white hover:bg-green-dark shadow-[0_6px_18px_rgba(22,163,74,0.22)] hover:shadow-[0_10px_26px_rgba(22,163,74,0.28)]"
      : "bg-white text-ink border border-line hover:border-green hover:text-green";
  return (
    <a href={href} className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </a>
  );
}
