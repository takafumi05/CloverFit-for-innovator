import { SAMPLE_REPORT } from "@/lib/site-content";
import { CloverMark } from "./icons";

export default function ReportCard() {
  const { score, metrics, condition, note, nextAction } = SAMPLE_REPORT;
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);

  return (
    <div className="relative">
      {/* 背後の淡いグリーングロー（ガラスの奥行き） */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 bg-[radial-gradient(60%_60%_at_70%_20%,rgba(22,163,74,0.16),transparent_70%)]"
      />
      <div className="bg-white/90 backdrop-blur-xl border border-line rounded-[8px] shadow-[0_24px_70px_rgba(20,32,26,0.14)] p-6 md:p-7">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloverMark className="w-5 h-5 text-green" />
            <span className="font-inter font-bold text-[13px] tracking-tight text-ink">
              CloverFit スコアレポート
            </span>
          </div>
          <span className="font-inter text-[10px] font-semibold tracking-[0.15em] text-muted border border-line rounded-[3px] px-2 py-1">
            SAMPLE
          </span>
        </div>

        {/* スコアリング */}
        <div className="mt-6 flex items-center gap-6">
          <div className="relative shrink-0 w-[128px] h-[128px]">
            <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
              <circle
                cx="64"
                cy="64"
                r={r}
                fill="none"
                stroke="var(--color-line)"
                strokeWidth="10"
              />
              <circle
                cx="64"
                cy="64"
                r={r}
                fill="none"
                stroke="var(--color-green)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-inter font-extrabold text-[34px] leading-none text-ink">
                {score}
              </span>
              <span className="font-inter text-[11px] text-muted">/ 100</span>
            </div>
          </div>
          <div>
            <span className="font-inter text-[10px] font-semibold tracking-[0.18em] uppercase text-green">
              CloverFit Score
            </span>
            <p className="mt-1 font-sans font-bold text-[17px] text-ink leading-snug">
              心身コンディション
              <br />
              良好の目安
            </p>
            <span className="mt-2 inline-flex items-center gap-1.5 bg-green-tint text-green-dark text-[12px] font-medium rounded-[3px] px-2.5 py-1">
              主観コンディション：{condition}
            </span>
          </div>
        </div>

        {/* 指標 */}
        <div className="mt-6 grid grid-cols-2 gap-2">
          {metrics.map((m) => (
            <div
              key={m.label}
              className={`rounded-[4px] border px-3 py-2.5 ${
                m.highlight
                  ? "border-green/30 bg-green-tint"
                  : "border-line bg-surface"
              }`}
            >
              <div className="text-[11px] text-muted">{m.label}</div>
              <div className="mt-0.5">
                <span
                  className={`font-inter font-bold text-[20px] ${
                    m.highlight ? "text-green-dark" : "text-ink"
                  }`}
                >
                  {m.value}
                </span>
                <span className="ml-1 text-[11px] text-muted">{m.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 所見・次回アクション */}
        <div className="mt-4 space-y-2.5">
          <div>
            <div className="text-[11px] font-semibold text-muted">今日の所見</div>
            <p className="mt-0.5 text-[13px] text-ink leading-relaxed">{note}</p>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-muted">
              次回おすすめアクション
            </div>
            <p className="mt-0.5 text-[13px] text-ink leading-relaxed">
              {nextAction}
            </p>
          </div>
        </div>

        <p className="mt-5 text-[10.5px] text-muted leading-relaxed border-t border-line pt-3">
          ※ 医療的診断ではなく、行動変容を目的としたコンディション把握の目安です。
        </p>
      </div>
    </div>
  );
}
