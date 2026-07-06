// 現行LPの共通クラス（.wrap / section / .label / h2 / .sub）を Tailwind 定数化
export const WRAP = "max-w-[1080px] mx-auto px-12 max-md:px-6";
export const SECTION_TOP = "border-t border-border py-[110px] max-md:py-[72px]";

export const LABEL =
  "block font-inter text-[10px] font-semibold tracking-[0.22em] text-accent uppercase mb-9";
export const H2 =
  "font-sans font-black text-[clamp(28px,3.8vw,48px)] leading-[1.22] tracking-[-0.02em] text-tp mb-8";
export const SUB =
  "font-light text-[clamp(15px,1.5vw,17px)] leading-[2] text-ts max-w-[520px]";
