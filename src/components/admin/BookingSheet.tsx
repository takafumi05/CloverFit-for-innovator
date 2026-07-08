import { useEffect, useState } from "react";
import { formatDateTimeSec, timeAgo, type Booking } from "@/lib/format";
import { StatusBadge } from "./ui";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";

const STATUS_OPTIONS = [
  { value: "new", label: "新規" },
  { value: "contacted", label: "連絡済み" },
  { value: "scheduled", label: "日程確定" },
  { value: "completed", label: "完了" },
  { value: "cancelled", label: "キャンセル" },
];

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 py-2.5 border-b border-line/70">
      <span className="text-[12px] font-semibold text-muted pt-0.5">{label}</span>
      <span className="text-[13.5px] text-ink leading-relaxed break-words whitespace-pre-wrap">
        {value}
      </span>
    </div>
  );
}

export default function BookingSheet({
  booking,
  saving,
  onClose,
  onSave,
}: {
  booking: Booking | null;
  saving: boolean;
  onClose: () => void;
  onSave: (status: string, note: string) => void;
}) {
  // 閉じるアニメーション中も内容を保持するため、直近の booking を保持
  const [current, setCurrent] = useState<Booking | null>(booking);
  const [status, setStatus] = useState("new");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (booking) {
      setCurrent(booking);
      setStatus(booking.status);
      setNote(booking.admin_note || "");
    }
  }, [booking]);

  const b = current;

  return (
    <Sheet
      open={!!booking}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent side="right" className="p-0">
        {b && (
          <>
            <div className="flex items-center gap-3 px-6 py-4 border-b border-line pr-14 shrink-0">
              <SheetTitle>お問い合わせ詳細</SheetTitle>
              <StatusBadge status={b.status} />
            </div>
            <SheetDescription className="sr-only">
              お問い合わせの詳細情報とステータス編集
            </SheetDescription>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="font-sans font-bold text-[18px] text-ink">
                {b.company || "—"}
              </div>
              <div className="text-[13px] text-muted mt-0.5">{b.name}</div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="bg-surface border border-line rounded-[6px] px-3 py-2.5">
                  <div className="text-[10px] font-semibold tracking-[0.1em] text-muted uppercase">
                    受付日時
                  </div>
                  <div className="text-[13px] text-ink font-medium mt-1 tabular-nums">
                    {formatDateTimeSec(b.created_at)}
                  </div>
                  <div className="text-[11px] text-green mt-0.5">
                    {timeAgo(b.created_at)}
                  </div>
                </div>
                <div className="bg-surface border border-line rounded-[6px] px-3 py-2.5">
                  <div className="text-[10px] font-semibold tracking-[0.1em] text-muted uppercase">
                    更新日時
                  </div>
                  <div className="text-[13px] text-ink font-medium mt-1 tabular-nums">
                    {formatDateTimeSec(b.updated_at)}
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">
                    {timeAgo(b.updated_at)}
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <Row label="メール" value={b.email} />
                <Row label="電話" value={b.phone || "—"} />
                <Row label="従業員数" value={b.employee_count || "—"} />
                <Row label="実施希望人数" value={b.headcount || "—"} />
                <Row label="実施希望時期" value={b.timing || "—"} />
                <Row label="実施場所" value={b.venue || "—"} />
                <Row label="興味プラン" value={b.plan || "—"} />
                <Row label="相談内容" value={b.message || "—"} />
                <Row label="ID" value={`#${b.id}`} />
              </div>
            </div>

            <div className="border-t border-line px-6 py-4 bg-white/70 shrink-0">
              <label className="text-[10px] font-semibold tracking-[0.1em] text-muted uppercase block mb-1.5">
                ステータス
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white border border-line rounded-[6px] px-3 py-2.5 text-ink text-[14px] outline-none focus:border-green mb-3"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <label className="text-[10px] font-semibold tracking-[0.1em] text-muted uppercase block mb-1.5">
                管理メモ
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="連絡日時、メモなど..."
                className="w-full bg-white border border-line rounded-[6px] px-3 py-2.5 text-ink text-[14px] outline-none focus:border-green resize-y min-h-[70px] mb-3"
              />
              <div className="flex gap-2.5 justify-end">
                <button
                  onClick={onClose}
                  className="bg-white border border-line rounded-[6px] px-5 py-2.5 text-muted text-[14px] hover:text-ink transition-colors"
                >
                  閉じる
                </button>
                <button
                  onClick={() => onSave(status, note)}
                  disabled={saving}
                  className="bg-green text-white rounded-[6px] px-6 py-2.5 font-bold text-[14px] hover:bg-green-dark disabled:opacity-50 transition-colors"
                >
                  {saving ? "保存中..." : "保存する"}
                </button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
