import { H2, LABEL, SECTION_TOP, SUB, WRAP } from "./styles";

const TITLES = [
  "慶應義塾大学名誉教授",
  "武蔵野大学ウェルビーイング学部長",
  "ウェルビーイング学会代表理事",
  "慶應義塾大学ウェルビーイングリサーチセンター長を務め、Well-being研究に従事",
];

export default function Supervisor() {
  return (
    <section id="supervisor" className={SECTION_TOP}>
      <div className={WRAP}>
        <div className="grid grid-cols-2 gap-20 items-center max-[900px]:grid-cols-1 max-[900px]:gap-14">
          <div className="flex flex-col gap-6 r on">
            <span className={LABEL}>Supervisor</span>
            <h2 className={H2}>
              このプログラムには
              <br />
              科学的根拠がある。
            </h2>
            <p className={SUB}>
              Well-being研究の第一人者、前野隆司教授が監修。心理学や幸福学の知見をプログラムに組み込むことで、心理的効果を科学的に担保しています。
            </p>
          </div>

          <div className="r d2 on">
            <div className="border border-border rounded-[14px] overflow-hidden bg-card">
              <div className="w-full overflow-hidden relative bg-[#0c0c0c] aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/supervisor.jpg"
                  alt="前野隆司"
                  className="w-full h-full object-cover object-[top_center] block brightness-[0.82] saturate-[0.88] contrast-[1.04]"
                />
              </div>
              <div className="px-8 py-7 border-t border-border flex flex-col gap-1.5">
                <span className="block font-inter text-[9px] font-semibold tracking-[0.2em] text-accent uppercase">
                  Supervisor
                </span>
                <span className="block font-sans font-bold text-[18px] text-tp tracking-[-0.01em] mt-0.5 mb-2">
                  前野 隆司
                </span>
                <ul className="list-none flex flex-col gap-1">
                  {TITLES.map((t) => (
                    <li
                      key={t}
                      className="relative pl-[14px] font-sans font-light text-[13px] text-ts leading-[1.7] before:content-[''] before:absolute before:left-0 before:top-[10px] before:w-1 before:h-px before:bg-border"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
                <p className="font-sans font-light text-[12px] text-[#444] leading-[1.7] mt-2.5 pt-2.5 border-t border-border">
                  著書に『幸せのメカニズム実践・幸福学入門』（2013年）など多数
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
