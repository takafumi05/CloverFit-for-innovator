import { LINE_URL } from "@/lib/constants";
import { LineIcon } from "./icons";

const PILLARS = [
  { label: "Body", text: "動ける身体をつくる機能的トレーニング" },
  { label: "Mind", text: "心拍データからメンタルヘルスを可視化" },
  { label: "Community", text: "経営者の仲間と本音で話せる特別な空間" },
];

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen grid grid-cols-[1fr] overflow-hidden"
    >
      {/* 背景 */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/training-bg.jpg"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-[30%_center] block brightness-[0.45] saturate-[0.65] scale-[1.03]"
        />
      </div>
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(to_right,rgba(5,5,5,0.88)_0%,rgba(5,5,5,0.55)_50%,rgba(5,5,5,0.05)_100%)] max-[960px]:bg-[linear-gradient(to_bottom,rgba(5,5,5,0.18)_0%,rgba(5,5,5,0.78)_65%,rgba(5,5,5,0.96)_100%)]" />

      {/* コンテンツ */}
      <div className="relative z-[2] flex flex-col justify-center pt-14 pr-16 pb-[120px] pl-12 max-[960px]:pt-12 max-[960px]:px-6 max-[960px]:pb-[70px]">
        <div className="inline-flex items-center gap-[10px] mb-8 r on">
          <span className="font-inter text-[13px] font-semibold tracking-[0.18em] text-accent uppercase">
            CloverFit for Innovator
          </span>
        </div>

        <div className="inline-flex self-start items-center gap-[10px] mb-7 bg-white/[0.06] border border-white/[0.12] rounded-[100px] px-[18px] py-2 r on">
          <span className="font-sans text-[12px] font-medium text-[rgba(232,232,232,0.85)] tracking-[0.04em]">
            <span className="text-white font-bold">
              慶應義塾大学 前野隆司名誉教授
            </span>
            監修プログラム
          </span>
        </div>

        <h1 className="font-sans font-black text-[clamp(38px,5.5vw,72px)] leading-[1.18] tracking-[-0.02em] text-tp mb-9 r d1 on">
          <span className="text-accent">身体</span>・
          <span className="text-accent">心</span>・
          <span className="text-accent">仲間</span>が
          <br />
          60分で揃う。
        </h1>

        <p className="font-light text-[clamp(15px,1.5vw,17px)] leading-[2] text-[rgba(232,232,232,0.58)] max-w-[460px] mb-[52px] r d2 on">
          ジム、カウンセリング、交流会——
          <br />
          全部別々に通う時間は確保できない、
          <br />
          <br />
          <strong className="font-bold text-[rgba(232,232,232,0.85)]">
            起業家・経営者のための
            <br />
            フィジカル × メンタルトレーニング
          </strong>
        </p>

        <div className="flex items-stretch border border-border rounded-xl overflow-hidden max-w-[460px] mb-12 r d3 on">
          {PILLARS.map((p) => (
            <div
              key={p.label}
              className="flex-1 px-[22px] py-5 border-r border-border last:border-r-0 flex flex-col gap-[5px]"
            >
              <span className="font-inter text-[9px] font-semibold tracking-[0.2em] text-accent uppercase">
                {p.label}
              </span>
              <span className="font-sans font-light text-[11px] text-ts leading-[1.7]">
                {p.text}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-6 flex-wrap r d4 on">
          <a
            href={LINE_URL}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-3 bg-[#06C755] text-white font-sans font-bold text-[16px] tracking-[0.04em] no-underline cursor-pointer px-9 py-[18px] rounded-xl transition-[background,box-shadow] duration-200 shadow-[0_4px_20px_rgba(6,199,85,0.3)] hover:bg-[#05b34c] hover:shadow-[0_8px_28px_rgba(6,199,85,0.4)]"
          >
            <LineIcon />
            公式LINEで体験予約する
          </a>
        </div>
      </div>
    </section>
  );
}
