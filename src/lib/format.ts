import { STATUS_MAP } from "./constants";

export type Booking = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  position: string | null;
  company: string | null;
  message: string | null;
  employee_count: string | null;
  headcount: string | null;
  timing: string | null;
  venue: string | null;
  plan: string | null;
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

export type Analytics = {
  range: string;
  totals: { pv: number; sessions: number; avgPageDwellMs: number };
  byDay: { day: string; count: number }[];
  byCountry: { country: string; count: number }[];
  byRegion: { region: string; count: number }[];
  byDevice: { device: string; count: number }[];
  byBrowser: { browser: string; count: number }[];
  topPages: { path: string; count: number }[];
  sectionDwell: { section: string; avg_ms: number; count: number }[];
};

export function statusLabel(s: string): string {
  return STATUS_MAP[s] || s;
}

// D1 の CURRENT_TIMESTAMP は "YYYY-MM-DD HH:MM:SS"（UTC）。UTC として解釈する。
function toDate(d: string): Date {
  return new Date(d.includes("T") ? d : d.replace(" ", "T") + "Z");
}

export function formatDateTime(d: string | null): string {
  if (!d) return "—";
  return toDate(d).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTimeSec(d: string | null): string {
  if (!d) return "—";
  return toDate(d).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function timeAgo(d: string | null): string {
  if (!d) return "";
  const diff = Date.now() - toDate(d).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "たった今";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}分前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}時間前`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}日前`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}ヶ月前`;
  return `${Math.floor(mo / 12)}年前`;
}

// ミリ秒 → "1分23秒" / "45秒" 形式
export function formatDuration(ms: number | null): string {
  if (!ms || ms < 0) return "0秒";
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}秒`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return rem ? `${min}分${rem}秒` : `${min}分`;
}
