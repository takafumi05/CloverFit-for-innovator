import { Container } from "./primitives";
import { ArrowIcon } from "./icons";

export default function CTA() {
  return (
    <section className="relative overflow-hidden">
      {/* 背景写真（コミュニティ） */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/288974.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* グリーンオーバーレイ */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(21,128,61,0.94)_0%,rgba(22,163,74,0.9)_60%,rgba(30,174,87,0.92)_100%)]" />

      <Container className="relative py-20 md:py-28 text-center">
        <p className="font-inter font-extrabold text-[clamp(30px,5vw,52px)] leading-none tracking-[-0.02em] text-white/95">
          <span className="text-[#bff5d2]">T</span>RY IT
        </p>
        <h2 className="mt-5 font-sans font-bold text-[clamp(23px,3.4vw,36px)] leading-[1.35] tracking-[-0.01em] text-white">
          まずは無料体験会から始めませんか？
        </h2>
        <p className="mt-5 mx-auto max-w-[640px] text-[15px] md:text-[16px] leading-[1.95] text-white/90">
          説明を聞くだけでなく、実際に体験することで価値を感じやすいプログラムです。まずは5〜10名程度の社員さま向けに、無料で実施できます。
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a
            href="#contact"
            className="group inline-flex items-center gap-2.5 font-sans font-bold text-[15px] pl-8 pr-6 py-4 rounded-full bg-white text-green-dark hover:bg-green-tint transition-colors duration-200 no-underline shadow-[0_12px_34px_rgba(0,0,0,0.2)]"
          >
            無料体験会を申し込む
            <ArrowIcon className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
          </a>
          <a
            href="#contact"
            className="inline-flex items-center justify-center font-sans font-bold text-[15px] px-8 py-4 rounded-full bg-transparent text-white border border-white/70 hover:bg-white/10 transition-colors duration-200 no-underline"
          >
            導入について相談する
          </a>
        </div>
      </Container>
    </section>
  );
}
