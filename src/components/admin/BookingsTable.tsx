import { formatDateTime, type Booking } from "@/lib/format";
import { StatusBadge } from "./ui";

const FILTERS = [
  { value: "all", label: "すべて" },
  { value: "new", label: "新規" },
  { value: "contacted", label: "連絡済み" },
  { value: "scheduled", label: "日程確定" },
  { value: "completed", label: "完了" },
  { value: "cancelled", label: "キャンセル" },
];

const PAGE_LIMIT = 20;

export default function BookingsTable({
  bookings,
  total,
  filter,
  page,
  onFilter,
  onPage,
  onOpen,
}: {
  bookings: Booking[] | null;
  total: number;
  filter: string;
  page: number;
  onFilter: (f: string) => void;
  onPage: (p: number) => void;
  onOpen: (b: Booking) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  return (
    <>
      <div className="mb-6">
        <h1 className="font-inter font-bold text-[22px] tracking-[-0.02em] text-ink">
          お問い合わせ一覧
        </h1>
        <p className="text-[14px] text-muted mt-1">無料体験・導入相談の管理</p>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => onFilter(f.value)}
            className={`rounded-[6px] px-4 py-2 font-inter text-[12px] font-medium transition-colors border ${
              filter === f.value
                ? "bg-green-tint border-green/30 text-green"
                : "bg-white border-line text-muted hover:text-ink hover:border-[#cfd8d2]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-line rounded-[8px] overflow-hidden shadow-[0_1px_3px_rgba(20,32,26,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-line bg-surface/60">
                {["会社名", "担当者", "興味プラン", "ステータス", "受付日", ""].map(
                  (h, i) => (
                    <th
                      key={i}
                      className="px-5 py-3 text-left font-inter text-[11px] font-semibold tracking-[0.08em] text-muted uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {bookings === null ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted text-[14px]">
                    読み込み中...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-14 text-muted">
                    お問い合わせがありません
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-line last:border-b-0 hover:bg-surface transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-[14px] text-ink">
                        {b.company || "—"}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-[14px] text-ink">{b.name}</div>
                      <div className="text-[12.5px] text-muted">{b.email}</div>
                    </td>
                    <td className="px-5 py-3.5 text-[13.5px] text-ink whitespace-nowrap">
                      {b.plan || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-muted whitespace-nowrap">
                      {formatDateTime(b.created_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => onOpen(b)}
                        className="bg-white border border-line rounded-[5px] px-3 py-1.5 text-[12px] text-ink/70 hover:border-green hover:text-green transition-colors"
                      >
                        詳細
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {bookings && bookings.length > 0 && (
          <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-line">
            <span className="text-[13px] text-muted mr-1">
              全{total}件 / {page}/{totalPages}ページ
            </span>
            <button
              onClick={() => onPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="bg-white border border-line rounded-[5px] px-3 py-1.5 text-[13px] text-muted hover:text-ink hover:border-[#cfd8d2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              前へ
            </button>
            <button
              onClick={() => onPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="bg-white border border-line rounded-[5px] px-3 py-1.5 text-[13px] text-muted hover:text-ink hover:border-[#cfd8d2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              次へ
            </button>
          </div>
        )}
      </div>
    </>
  );
}
