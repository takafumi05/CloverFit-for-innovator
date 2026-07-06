import { H2, LABEL, SECTION_TOP, SUB, WRAP } from "./styles";

const STATS = [
  {
    num: "87",
    unit: "%",
    label: "の起業家がメンタルヘルスに問題を抱えている",
    src: "Founder Reports, 2026",
    delay: "d1",
  },
  {
    num: "49",
    unit: "%",
    label: "の起業家が精神疾患を経験している",
    src: "Freeman et al., 2015",
    delay: "d2",
  },
  {
    num: "10",
    unit: "倍",
    label: "躁うつ病リスクが一般人より10倍高い",
    src: "Freeman et al., 2015",
    delay: "d3",
  },
];

export default function Problem() {
  return (
    <section id="problem" className={SECTION_TOP}>
      <div className={WRAP}>
        <div className="grid grid-cols-[460px_1fr] gap-[100px] items-start max-[960px]:grid-cols-1 max-[960px]:gap-16">
          <div>
            <span className={`${LABEL} r on`}>Problem</span>
            <h2 className={`${H2} r d1 on`}>
              挑戦している人ほど
              <br />
              心は<span className="text-accent">壊れやすい</span>。
            </h2>
            <p className={`${SUB} r d2 on`}>
              起業後の心理的ストレス、トレーニング時間の消滅、コミュニティの欠如。
            </p>
          </div>

          <div className="flex flex-col gap-[2px]">
            {STATS.map((s) => (
              <div
                key={s.label}
                className={`bg-card border border-border rounded-[14px] px-10 py-8 flex items-center gap-8 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)] max-md:px-5 max-md:py-6 max-md:gap-5 r ${s.delay} on`}
              >
                <div className="font-inter font-bold text-[clamp(48px,5.5vw,64px)] leading-none text-accent tracking-[-0.04em] shrink-0 min-w-[110px]">
                  {s.num}
                  <span className="text-[0.85em] tracking-[-0.02em] align-baseline">
                    {s.unit}
                  </span>
                </div>
                <div className="w-px h-10 bg-border shrink-0" />
                <div>
                  <p className="font-sans font-light text-[14px] leading-[1.8] text-ts mb-[5px]">
                    {s.label}
                  </p>
                  <span className="font-inter text-[10px] text-[#333] tracking-[0.06em]">
                    {s.src}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
