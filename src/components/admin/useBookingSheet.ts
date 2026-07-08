import { useState } from "react";
import type { Booking } from "@/lib/format";

/** 詳細Sheetの開閉 + ステータス/メモ保存。保存後に onSaved でデータ再取得。 */
export function useBookingSheet(
  authFetch: (path: string, opts?: RequestInit) => Promise<Response>,
  onSaved: () => void | Promise<void>
) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(status: string, note: string) {
    if (!booking) return;
    setSaving(true);
    await authFetch(`/api/admin/bookings/${booking.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status, admin_note: note }),
    });
    setSaving(false);
    setBooking(null);
    await onSaved();
  }

  return {
    booking,
    open: (b: Booking) => setBooking(b),
    close: () => setBooking(null),
    saving,
    save,
  };
}
