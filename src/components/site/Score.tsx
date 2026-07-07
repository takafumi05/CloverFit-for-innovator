import { SCORE_ITEMS } from "@/lib/site-content";
import { BigEn, Container, Section } from "./primitives";
import { CheckIcon } from "./icons";
import ReportCard from "./ReportCard";

export default function Score() {
  return (
    <Section id="score" surface>
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* 説明 */}
          <div>
            <BigEn>SCORE</BigEn>
            <h2 className="mt-4 font-sans font-bold text-[clamp(20px,2.6vw,30px)] leading-[1.45] tracking-[-0.01em] text-ink">
              CloverFitスコアで、
              <br className="hidden sm:block" />
              心身の状態をわかりやすく。
            </h2>
            <p className="mt-5 text-[15px] leading-[1.95] text-muted">
              CloverFitスコアは、安静時心拍数、運動後の心拍回復幅、主観コンディション、簡易動作評価などをもとに、心身コンディションを可視化する独自指標です。
            </p>

            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
              {SCORE_ITEMS.map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-green shrink-0" />
                  <span className="text-[14px] text-ink">{item}</span>
                </div>
              ))}
            </div>

            <p className="mt-7 text-[12.5px] leading-relaxed text-muted bg-white border border-line rounded-[4px] px-4 py-3">
              ※ 医療的診断ではなく、行動変容を目的としたコンディション把握の目安です。
            </p>
          </div>

          {/* レポートサンプル（実データの画像に差し替え可能） */}
          <div className="lg:pl-4">
            <ReportCard />
          </div>
        </div>
      </Container>
    </Section>
  );
}
