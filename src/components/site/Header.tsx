"use client";

import { useEffect, useState } from "react";
import { Container } from "./primitives";
import { CloverMark, FEATURE_ICONS, LineIcon } from "./icons";

const SERVICE_LINKS = [
  {
    label: "サービスの特徴",
    href: "#features",
    icon: "spark",
    desc: "心拍で見える化する5つの特徴",
  },
  {
    label: "実施フロー",
    href: "#flow",
    icon: "clock",
    desc: "60分・測定から所見まで",
  },
  {
    label: "CloverFitスコア",
    href: "#score",
    icon: "pulse",
    desc: "コンディションを独自指標で",
  },
  {
    label: "導入メリット",
    href: "#benefits",
    icon: "report",
    desc: "企業・社員 双方の価値",
  },
];

const MOBILE_LINKS = [
  { label: "課題", href: "#problem" },
  { label: "CloverFitとは", href: "#about" },
  { label: "サービスの特徴", href: "#features" },
  { label: "実施フロー", href: "#flow" },
  { label: "CloverFitスコア", href: "#score" },
  { label: "導入メリット", href: "#benefits" },
  { label: "料金", href: "#pricing" },
  { label: "よくある質問", href: "#faq" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // solid = 白背景（スクロール時 or メガ展開時）／ それ以外はヒーロー上で透過
  const solid = scrolled || mega || open;

  const navItem = `px-3 py-2 rounded-[3px] text-[14px] font-medium transition-colors duration-200 ${
    solid
      ? "text-ink/80 hover:text-green hover:bg-green-tint"
      : "text-white/90 hover:text-white hover:bg-white/10"
  }`;

  return (
    <header
      onMouseLeave={() => setMega(false)}
      className={`fixed inset-x-0 top-0 z-[300] border-b transition-all duration-300 ${
        solid
          ? "bg-white/90 backdrop-blur-xl border-line shadow-[0_1px_20px_rgba(20,32,26,0.05)]"
          : "bg-transparent border-transparent"
      }`}
    >
      <Container className="flex items-center justify-between h-16">
        <a href="#top" className="flex items-center gap-2 no-underline">
          <CloverMark
            className={`w-7 h-7 ${solid ? "text-green" : "text-white"}`}
          />
          <span
            className={`font-inter font-extrabold text-[19px] tracking-[-0.02em] ${
              solid ? "text-ink" : "text-white"
            }`}
          >
            Clover
            <span className={solid ? "text-green" : "text-[#7cf0a8]"}>Fit</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-1">
          <a
            href="#problem"
            onMouseEnter={() => setMega(false)}
            className={navItem}
          >
            課題
          </a>
          <button
            type="button"
            onMouseEnter={() => setMega(true)}
            className={`${navItem} inline-flex items-center gap-1 cursor-pointer ${
              mega ? "!text-green !bg-green-tint" : ""
            }`}
          >
            サービス
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`mt-0.5 transition-transform duration-200 ${
                mega ? "rotate-180" : ""
              }`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <a
            href="#pricing"
            onMouseEnter={() => setMega(false)}
            className={navItem}
          >
            料金
          </a>
          <a href="#faq" onMouseEnter={() => setMega(false)} className={navItem}>
            よくある質問
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="#contact"
            className={`text-[14px] font-medium transition-colors no-underline ${
              solid
                ? "text-ink/75 hover:text-green"
                : "text-white/85 hover:text-white"
            }`}
          >
            まずは相談
          </a>
          <a
            href="#contact"
            className={`inline-flex items-center gap-2 font-sans font-bold text-[14px] px-5 py-2.5 rounded-[3px] transition-colors duration-200 no-underline ${
              solid
                ? "bg-green text-white hover:bg-green-dark shadow-[0_6px_18px_rgba(22,163,74,0.22)]"
                : "bg-white text-green-dark hover:bg-green-tint"
            }`}
          >
            <LineIcon className="w-[18px] h-[18px]" />
            無料体験を申し込む
          </a>
        </div>

        <button
          type="button"
          aria-label="メニュー"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden flex flex-col justify-center gap-[5px] w-10 h-10 -mr-2"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`block h-[2px] w-6 rounded transition-all duration-300 ${
                solid ? "bg-ink" : "bg-white"
              } ${
                open && i === 0 ? "translate-y-[7px] rotate-45" : ""
              } ${open && i === 1 ? "opacity-0" : ""} ${
                open && i === 2 ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          ))}
        </button>
      </Container>

      {/* 全幅メガメニュー */}
      <div
        className={`hidden md:block absolute inset-x-0 top-full border-t-2 border-green bg-white/95 backdrop-blur-xl shadow-[0_24px_50px_rgba(20,32,26,0.10)] transition-all duration-200 ${
          mega
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible -translate-y-2 pointer-events-none"
        }`}
      >
        <Container className="py-8">
          <div className="grid grid-cols-[220px_1fr] gap-10 items-start">
            <div>
              <p className="font-inter font-extrabold text-[26px] leading-none text-ink">
                <span className="text-green">S</span>ERVICE
              </p>
              <p className="mt-2 text-[13px] font-bold text-muted">サービス</p>
              <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
                運動 × 心拍測定 × フィードバックで、社員の心身を見える化します。
              </p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {SERVICE_LINKS.map((l) => {
                const Icon = FEATURE_ICONS[l.icon];
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMega(false)}
                    className="group block bg-surface hover:bg-green-tint border border-line hover:border-green/30 rounded-[6px] p-5 transition-colors duration-200 no-underline"
                  >
                    <div className="w-10 h-10 rounded-[5px] bg-white border border-line flex items-center justify-center text-green group-hover:bg-green group-hover:text-white group-hover:border-green transition-colors">
                      {Icon && <Icon className="w-5 h-5" />}
                    </div>
                    <div className="mt-4 font-sans font-bold text-[14px] text-ink">
                      {l.label}
                    </div>
                    <div className="mt-1 text-[12px] leading-relaxed text-muted">
                      {l.desc}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </Container>
      </div>

      {/* モバイルメニュー */}
      <div
        className={`md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-line transition-[max-height] duration-300 ${
          open ? "max-h-[560px]" : "max-h-0"
        }`}
      >
        <div className="px-6 py-4 flex flex-col">
          {MOBILE_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-3 text-[15px] text-ink/85 border-b border-line/70 no-underline hover:text-green"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="mt-4 inline-flex items-center justify-center gap-2 font-sans font-bold text-[15px] px-6 py-3.5 rounded-[3px] bg-green text-white no-underline"
          >
            <LineIcon className="w-[18px] h-[18px]" />
            無料体験を申し込む
          </a>
        </div>
      </div>
    </header>
  );
}
