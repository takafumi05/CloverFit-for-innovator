import { Container } from "./primitives";
import { ArrowIcon, InstagramIcon, LineIcon } from "./icons";

const FOOTER_LINKS = [
  { label: "課題", href: "#problem" },
  { label: "CloverFitとは", href: "#about" },
  { label: "サービスの特徴", href: "#features" },
  { label: "実施フロー", href: "#flow" },
  { label: "CloverFitスコア", href: "#score" },
  { label: "料金", href: "#pricing" },
  { label: "よくある質問", href: "#faq" },
  { label: "お問い合わせ", href: "#contact" },
];

const TICKER = [
  "見える化から、はじめよう。",
  "まずは無料体験から。",
  "社内ジムがなくても実施可能。",
  "健康経営を“使われる施策”へ。",
];

export default function Footer() {
  return (
    <footer className="bg-[#0c130f] text-white overflow-hidden">
      {/* テロップ */}
      <div className="border-y border-white/10 py-3.5 overflow-hidden">
        <div className="animate-marquee inline-flex whitespace-nowrap will-change-transform">
          {[0, 1].map((dup) => (
            <div key={dup} className="inline-flex items-center">
              {TICKER.map((t) => (
                <span key={t} className="inline-flex items-center">
                  <span className="font-inter text-[13px] font-semibold tracking-wide text-white/85 px-6">
                    {t}
                  </span>
                  <span className="w-1.5 h-1.5 rotate-45 bg-green" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Container className="pt-16 pb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <p className="text-[15px] text-white/70 leading-relaxed max-w-[420px]">
              社員の心身コンディションを可視化する、法人向けウェルビーイングプログラム。
            </p>
            <a
              href="#contact"
              className="group mt-6 inline-flex items-center gap-2.5 font-sans font-bold text-[15px] pl-5 pr-5 py-3.5 rounded-full bg-green text-white hover:bg-green-dark transition-colors no-underline"
            >
              <LineIcon className="w-5 h-5" />
              無料体験を申し込む
              <ArrowIcon className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </div>

          <div className="flex flex-col gap-5 md:items-end">
            <nav className="grid grid-cols-2 gap-x-8 gap-y-2.5 md:text-right">
              {FOOTER_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-[13.5px] text-white/60 hover:text-green transition-colors no-underline"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <a
              href="https://www.instagram.com/cloverfit2026/"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 text-[13px] text-white/60 hover:text-white transition-colors no-underline"
            >
              <InstagramIcon className="w-4 h-4" />
              @cloverfit2026
            </a>
          </div>
        </div>

        {/* BIG TEXT */}
        <div className="mt-12 leading-none select-none">
          <span className="block font-inter font-extrabold text-[clamp(56px,17vw,232px)] tracking-[-0.045em] text-white">
            Clover<span className="text-green">Fit</span>
          </span>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="font-inter text-[12px] text-white/40 tracking-[0.02em]">
            © 2026 CloverFit. All rights reserved.
          </span>
          <span className="text-[11.5px] text-white/40 leading-relaxed">
            ※ CloverFitスコアは医療的診断ではなく、心身コンディション把握の目安です。
          </span>
        </div>
      </Container>
    </footer>
  );
}
