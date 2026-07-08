import { formatDuration, type Analytics } from "@/lib/format";
import { StatCard, Panel } from "./ui";
import {
  TimeSeriesChart,
  DonutChart,
  HBar,
  SECTION_LABELS,
  regionLabel,
} from "./charts";

export default function AnalyticsPanel({
  data,
  range,
  onRange,
}: {
  data: Analytics | null;
  range: "7d" | "30d";
  onRange: (r: "7d" | "30d") => void;
}) {
  return (
    <>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-inter font-bold text-[22px] tracking-[-0.02em] text-ink">
            アクセス解析
          </h1>
          <p className="text-[14px] text-muted mt-1">
            国・地域・デバイス・滞在時間などの計測（Cookie不使用）
          </p>
        </div>
        <div className="inline-flex bg-white border border-line rounded-[6px] p-0.5">
          {(["7d", "30d"] as const).map((r) => (
            <button
              key={r}
              onClick={() => onRange(r)}
              className={`px-3.5 py-1.5 rounded-[4px] text-[12.5px] font-medium transition-colors ${
                range === r ? "bg-green text-white" : "text-muted hover:text-ink"
              }`}
            >
              {r === "7d" ? "7日間" : "30日間"}
            </button>
          ))}
        </div>
      </div>

      {!data ? (
        <div className="text-center py-16 text-muted text-[14px]">読み込み中...</div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard label="総ページビュー" value={data.totals.pv} accent />
            <StatCard label="セッション数" value={data.totals.sessions} />
            <StatCard
              label="平均ページ滞在"
              value={formatDuration(data.totals.avgPageDwellMs)}
            />
          </div>

          {data.totals.pv === 0 && (
            <div className="bg-green-tint border border-green/20 rounded-[8px] px-5 py-4 text-[13px] text-green-dark">
              まだ計測データがありません。公開サイトへのアクセスが発生すると、ここに集計が表示されます。
            </div>
          )}

          <Panel title="ページビュー推移">
            <div className="px-4 py-4">
              <TimeSeriesChart data={data.byDay} />
            </div>
          </Panel>

          <div className="grid md:grid-cols-2 gap-3">
            <Panel title="デバイス">
              <div className="px-5 py-5">
                <DonutChart data={data.byDevice} />
              </div>
            </Panel>
            <Panel title="ブラウザ">
              <div className="px-4 py-4">
                <HBar
                  data={data.byBrowser.map((b) => ({
                    label: b.browser,
                    value: b.count,
                  }))}
                />
              </div>
            </Panel>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <Panel title="国・地域">
              <div className="px-4 py-4">
                <HBar
                  data={data.byCountry.map((c) => ({
                    label: c.country,
                    value: c.count,
                  }))}
                />
              </div>
            </Panel>
            <Panel title="都道府県（推定）">
              <div className="px-4 py-4">
                <HBar
                  data={data.byRegion.map((r) => ({
                    label: regionLabel(r.region),
                    value: r.count,
                  }))}
                  emptyLabel="都道府県データはまだありません"
                />
              </div>
            </Panel>
          </div>

          <Panel title="ページ別PV">
            <div className="px-4 py-4">
              <HBar
                data={data.topPages.map((p) => ({
                  label: p.path,
                  value: p.count,
                }))}
              />
            </div>
          </Panel>

          <Panel title="セクション別 平均滞在時間">
            <div className="px-4 py-4">
              <HBar
                data={data.sectionDwell.map((s) => ({
                  label: SECTION_LABELS[s.section] || s.section,
                  value: Math.round(s.avg_ms),
                }))}
                fmt={formatDuration}
                emptyLabel="セクション滞在の計測はまだありません"
              />
            </div>
          </Panel>
        </div>
      )}
    </>
  );
}
