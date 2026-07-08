import { formatDateTime, timeAgo, type Booking, type Stats } from "@/lib/format";
import { StatCard, StatusBadge, Panel } from "./ui";

export default function Dashboard({
  stats,
  recent,
  onOpen,
}: {
  stats: Stats | null;
  recent: Booking[] | null;
  onOpen: (b: Booking) => void;
}) {
  return (
    <>
      <div className="mb-7">
        <h1 className="font-inter font-bold text-[22px] tracking-[-0.02em] text-ink">
          ダッシュボード
        </h1>
        <p className="text-[14px] text-muted mt-1">お問い合わせ状況の概要</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {stats ? (
          <>
            <StatCard label="総件数" value={stats.total} accent />
            <StatCard label="新規" value={stats.new_count ?? 0} />
            <StatCard label="連絡済み" value={stats.contacted_count ?? 0} />
            <StatCard label="日程確定" value={stats.scheduled_count ?? 0} />
            <StatCard label="完了" value={stats.completed_count ?? 0} />
          </>
        ) : (
          <div className="col-span-full text-center py-10 text-muted text-[14px]">
            読み込み中...
          </div>
        )}
      </div>

      <Panel title="最近のお問い合わせ">
        {recent === null ? (
          <div className="text-center py-12 text-muted text-[14px]">
            読み込み中...
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-14 text-muted">
            お問い合わせはまだありません
          </div>
        ) : (
          <div className="divide-y divide-line">
            {recent.map((b) => (
              <button
                key={b.id}
                onClick={() => onOpen(b)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-surface transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-medium text-[14px] text-ink truncate">
                    {b.company || "—"}
                  </div>
                  <div className="text-[12.5px] text-muted truncate">
                    {b.name}／{b.email}
                  </div>
                </div>
                <StatusBadge status={b.status} />
                <div className="text-[12px] text-muted whitespace-nowrap w-[92px] text-right">
                  {timeAgo(b.created_at) || formatDateTime(b.created_at)}
                </div>
              </button>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
