import { Container, Section, BigEn } from "./primitives";

const FORMULA = ["運動", "心拍測定", "心理的フィードバック", "レポート"];

export default function About() {
  return (
    <Section id="about">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* 左：テキスト */}
          <div>
            <BigEn>ABOUT</BigEn>
            <h2 className="mt-4 font-sans font-bold text-[clamp(20px,2.6vw,30px)] leading-[1.45] tracking-[-0.01em] text-ink">
              運動して終わりではなく、変化を見える化する。
            </h2>
            <p className="mt-5 text-[15px] leading-[1.95] text-muted">
              CloverFitは、心拍数を測りながら簡単な運動を行い、運動後の心拍回復幅や主観コンディションをもとに、社員一人ひとりの心身状態を可視化するプログラムです。実施後には CloverFitスコアや心拍回復データをもとにした簡易レポートを提供し、参加者が「自分の状態」を理解して日常の行動変容につなげることを目指します。
            </p>

            {/* 4要素の掛け合わせ */}
            <div className="mt-8 flex flex-wrap items-center gap-2.5 md:gap-3">
              {FORMULA.map((f, i) => (
                <div key={f} className="flex items-center gap-2.5 md:gap-3">
                  <span className="inline-flex items-center bg-surface border border-line rounded-[4px] px-3.5 md:px-4 py-2.5 text-[13px] md:text-[14px] font-medium text-ink">
                    {f}
                  </span>
                  {i < FORMULA.length - 1 && (
                    <span className="font-inter text-[16px] text-green font-bold">
                      ×
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 右：写真 */}
          <div className="relative overflow-hidden rounded-[4px] border border-line shadow-[0_20px_50px_rgba(20,32,26,0.10)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/288969.jpg"
              alt="CloverFit の紹介プレゼンテーション"
              className="w-full aspect-[4/3] object-cover object-[40%_center]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(4,26,14,0.5)_0%,transparent_45%)]" />
            <span className="absolute left-5 bottom-4 font-inter text-[11px] font-semibold tracking-[0.15em] uppercase text-white/90">
              CloverFit — presentation
            </span>
          </div>
        </div>
      </Container>
    </Section>
  );
}
