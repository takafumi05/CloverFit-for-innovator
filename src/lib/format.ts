import { STATUS_MAP } from "./constants";

export type Booking = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  position: string;
  company: string | null;
  message: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

export type Stats = {
  total: number;
  new_count: number | null;
  contacted_count: number | null;
  scheduled_count: number | null;
  completed_count: number | null;
  cancelled_count: number | null;
};

export function statusLabel(s: string): string {
  return STATUS_MAP[s] || s;
}

export function formatDateTime(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
