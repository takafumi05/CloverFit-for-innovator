import type { ReactNode } from "react";
import { H2, LABEL, SECTION_TOP, SUB, WRAP } from "./styles";

const FEATURES: { n: string; heading: ReactNode; text: string; delay: string }[] =
  [
    {
      n: "01",
      heading: (
        <>
          <span className="text-accent">60分</span>で全部が揃う
        </>
      ),
      text: "トレーニング・メンタルケア・仲間作り、別々に通う時間はない。だから1つのセッションに凝縮。",
      delay: "d1",
    },
    {
      n: "02",
      heading: (
        <>
          <span className="text-accent">経営者だけ</span>の空間
        </>
      ),
      text: "同じ重圧を知る仲間同士だから、すぐに分かりあえる。ただの交流会より深いつながりが、ここにある。",
      delay: "d2",
    },
    {
      n: "03",
      heading: (
        <>
          身体だけじゃない、<span className="text-accent">心も変わる</span>
        </>
      ),
      text: "身体だけ変わっても、心はついてこない。慶應義塾大学名誉教授監修のプログラムによって、心にもアプローチ。",
      delay: "d3",
    },
    {
      n: "04",
      heading: (
        <>
          <span className="text-accent">自分に投資</span>する時間
        </>
      ),
      text: "60分だけ、自分の心と身体に向き合う。それが日々のパフォーマンスを決定的に変える。",
      delay: "d4",
    },
  ];

export default function Solution() {
  return (
    <section id="solution" className={SECTION_TOP}>
      <div className={WRAP}>
        <div className="max-w-[680px] mb-14">
          <span className={`${LABEL} r on`}>Solution</span>
          <h2 className={`${H2} r d1 on`}>
            心も身体も
            <br />
            タフじゃなきゃ。
          </h2>
          <p className={`${SUB} r d2 on`}>
            CloverFitでは、身体・心・仲間が60分で揃う、
            <br />
            起業家・経営者のための場所。
          </p>
        </div>

        <div className="flex items-center gap-5 bg-card border border-border border-l-[3px] border-l-accent rounded-[14px] px-8 py-6 mb-[72px] flex-wrap r on">
          <div className="flex-1 min-w-[200px]">
            <span className="block font-inter text-[9px] font-semibold tracking-[0.2em] text-accent uppercase mb-1.5">
              Research — Swansea University
            </span>
            <p className="font-sans font-light text-[14px] text-tp leading-[1.75]">
              <span className="text-accent">運動と心理介入の組み合わせ</span>
              が、ヨガ・マインドフルネスなど他のどのアプローチよりも、メンタルヘルス改善効果が最も高い。
            </p>
          </div>
          <span className="font-inter text-[10px] text-[#444] tracking-[0.06em] shrink-0">
            Wilkie et al., Nature Human Behaviour, 2026
          </span>
        </div>

        <div className="grid grid-cols-2 gap-[10px] max-md:grid-cols-1">
          {FEATURES.map((f) => (
            <div
              key={f.n}
              className={`bg-card border border-border rounded-[14px] px-11 py-12 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_56px_rgba(0,0,0,0.5)] max-md:px-7 max-md:py-9 r ${f.delay} on`}
            >
              <span className="block font-inter text-[10px] font-semibold tracking-[0.18em] text-ts mb-7">
                {f.n}
              </span>
              <h3 className="font-sans font-bold text-[18px] leading-[1.45] text-tp mb-4">
                {f.heading}
              </h3>
              <p className="font-sans font-light text-[14px] leading-[1.95] text-ts">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
