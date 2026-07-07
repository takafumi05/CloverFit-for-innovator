import { Container } from "./primitives";
import { CheckIcon } from "./icons";

const FV_POINTS = [
  "法人向け",
  "ウェルビーイング施策",
  "心拍測定で可視化",
  "社内ジム不要",
  "無料体験から",
];

export default function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* 全幅の背景写真 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/hero-image.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-[50%_center]"
      />
      {/* グリーングラデーション（左を濃く、右で写真を見せる） */}
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(9,58,33,0.96)_0%,rgba(13,92,49,0.86)_40%,rgba(22,163,74,0.42)_66%,rgba(22,163,74,0.08)_100%)]" />
      {/* モバイル用の追加暗幕 */}
      <div className="absolute inset-0 bg-[rgba(8,45,26,0.22)] md:hidden" />

      {/* ゴースト大英字 */}
      <span
        aria-hidden="true"
        className="pointer-events-none select-none absolute left-2 top-1/2 -translate-y-1/2 font-inter font-extrabold text-white/[0.06] text-[16vw] leading-none tracking-[-0.04em] whitespace-nowrap"
      >
        WELLBEING
      </span>

      <Container className="relative">
        <div className="max-w-[820px] py-24">
          <span className="inline-flex items-center gap-2 bg-white/12 backdrop-blur-md border border-white/25 rounded-full px-3.5 py-1.5 text-[12px] font-semibold text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7cf0a8]" />
            慶應義塾大学 前野隆司名誉教授 監修
          </span>

          <h1 className="mt-6 font-sans font-bold text-white text-[clamp(25px,4.4vw,46px)] leading-[1.3] tracking-[-0.02em] drop-shadow-[0_2px_20px_rgba(0,0,0,0.25)]">
            社員の心身コンディションを、
            <br />
            <span className="text-[#7cf0a8]">見える化</span>する。
          </h1>

          <p className="mt-6 max-w-[540px] text-[15px] md:text-[16.5px] leading-[1.95] text-white/85">
            CloverFitは、心拍測定と運動を組み合わせた法人向けウェルビーイングプログラム。社員の疲労・回復力・集中状態を可視化し、成果を出せる心身状態づくりを支援します。
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#contact"
              className="inline-flex items-center justify-center font-sans font-bold text-[15px] px-7 py-3.5 rounded-[3px] bg-white text-green-dark hover:bg-green-tint transition-colors duration-200 no-underline shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
            >
              無料体験会を申し込む
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center font-sans font-bold text-[15px] px-7 py-3.5 rounded-[3px] bg-transparent text-white border border-white/60 hover:bg-white/10 transition-colors duration-200 no-underline"
            >
              まずは相談する
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2.5">
            {FV_POINTS.map((p) => (
              <li
                key={p}
                className="inline-flex items-center gap-1.5 text-[13px] text-white/85"
              >
                <CheckIcon className="w-4 h-4 text-[#7cf0a8] shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
