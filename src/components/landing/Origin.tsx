import { H2, LABEL, SECTION_TOP, SUB, WRAP } from "./styles";

const STORY = [
  {
    period: "高校時代",
    title: "トレーナーとして、現場に立つ。",
    desc: "高校生のうちからパーソナルトレーナーとして働き始め、身体づくりの本質を現場で学ぶ。学んだ知識を自分の身体づくりに活かし、高校生でボディコンテストにも出場する。",
    accent: false,
  },
  {
    period: "大学入学",
    title: "「他人よりかっこいい身体を目指すこと」が、すべてだった。",
    desc: "慶應義塾大学体育会でウエイトリフティングに取り組みながら、ボディビル競技でも結果を残した。重量の数字と鏡の中の肉体だけを追いかける日々。",
    accent: false,
  },
  {
    period: "転機",
    title: "過度な減量で、心が折れた。",
    desc: "極限まで絞り込む減量を繰り返すうち、精神的に追い詰められた。身体は仕上がっていっても、心がついてこなかった。「身体だけを鍛えても、人は健康にはなれない」——その実感が、CloverFitの出発点になった。",
    accent: true,
  },
  {
    period: "CloverFit創業",
    title: "自分に必要だったものを、仕組みにした。",
    desc: "心と身体を同時に整え、支え合える仲間がいる環境。自分が欲しかったその場所を、プログラムとして設計し、高齢者施設や企業への導入を実現。自分自身が事業を行う中で、起業家・経営者のメンタルヘルス問題に着目し、CloverFit for Innovatorを立ち上げた。",
    accent: true,
  },
];

export default function Origin() {
  return (
    <section id="origin" className={SECTION_TOP}>
      <div className={WRAP}>
        <div className="grid grid-cols-2 gap-20 items-center mb-20 max-[900px]:grid-cols-1 max-[900px]:gap-12 max-[900px]:mb-14">
          <div className="flex flex-col gap-6 r on">
            <span className={LABEL}>Origin</span>
            <h2 className={H2}>
              身体を鍛えるほど、
              <br />
              心が壊れていった。
            </h2>
            <p className={SUB}>
              高校時代からパーソナルトレーナーとして活動。慶應義塾大学でウエイトリフティング・ボディビルに打ち込む中で、身体だけを鍛え続けることの限界に気づいた。
            </p>
          </div>

          <div className="r d1 on">
            <div className="relative rounded-[14px] overflow-hidden border border-border bg-[#080808] aspect-[4/3] group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/founder.jpg"
                alt="小川貴史"
                className="w-full h-full object-cover object-[center_top] block brightness-[0.88] contrast-[1.04] saturate-[0.9] transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,5,5,0.55)_0%,transparent_50%)]" />
              <span className="absolute bottom-4 left-5 z-[1] font-inter text-[10px] font-semibold tracking-[0.18em] text-white/[0.32] uppercase">
                Founder — 小川 貴史
              </span>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <div className="flex flex-col gap-8 r d2 on">
            {STORY.map((s, i) => (
              <div key={s.period} className="flex gap-6 items-start">
                <div className="flex flex-col items-center shrink-0 pt-[3px]">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      s.accent ? "bg-accent" : "bg-border"
                    }`}
                  />
                  {i < STORY.length - 1 && (
                    <div className="w-px flex-1 min-h-10 bg-border mt-2" />
                  )}
                </div>
                <div>
                  <span className="block font-inter text-[10px] font-semibold tracking-[0.15em] text-ts uppercase mb-2">
                    {s.period}
                  </span>
                  <p className="font-sans font-bold text-[16px] text-tp leading-[1.4] mb-2">
                    {s.title}
                  </p>
                  <p className="font-sans font-light text-[14px] leading-[1.9] text-ts">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
