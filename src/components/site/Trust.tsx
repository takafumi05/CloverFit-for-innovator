import { BigEn, Container, Section } from "./primitives";
import { CheckIcon } from "./icons";

const TITLES = [
  "慶應義塾大学 名誉教授",
  "武蔵野大学 ウェルビーイング学部長",
  "ウェルビーイング学会 代表理事",
];

export default function Trust() {
  return (
    <Section id="supervisor" surface>
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* 写真 */}
          <div className="relative overflow-hidden rounded-[4px] border border-line shadow-[0_20px_50px_rgba(20,32,26,0.10)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/288972.jpg"
              alt="慶應義塾大学 前野隆司名誉教授とCloverFit"
              className="w-full aspect-[16/10] object-cover"
            />
          </div>

          {/* テキスト */}
          <div>
            <BigEn>SUPERVISED</BigEn>
            <h2 className="mt-4 font-sans font-bold text-[clamp(20px,2.6vw,30px)] leading-[1.45] tracking-[-0.01em] text-ink">
              科学的根拠に基づく、監修プログラム。
            </h2>
            <p className="mt-5 text-[15px] leading-[1.95] text-muted">
              Well-being研究の第一人者・
              <span className="text-ink font-medium">前野 隆司 名誉教授</span>
              が監修。心理学や幸福学の知見をプログラムに組み込むことで、体験の心理的効果に裏づけを持たせています。
            </p>
            <ul className="mt-6 space-y-2.5">
              {TITLES.map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <CheckIcon className="w-[18px] h-[18px] text-green shrink-0" />
                  <span className="text-[14.5px] text-ink">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
