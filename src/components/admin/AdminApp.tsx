"use client";

import { useEffect, useState } from "react";
import type { Analytics, Booking, Stats } from "@/lib/format";
import Sidebar, { type AdminPage } from "./Sidebar";
import LoginScreen from "./LoginScreen";
import Dashboard from "./Dashboard";
import BookingsTable from "./BookingsTable";
import BookingSheet from "./BookingSheet";
import AnalyticsPanel from "./AnalyticsPanel";

// JWT の exp(秒) を ms で返す。デコード不可なら 0（無効扱い）
function tokenExpMs(token: string): number {
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4)));
    return typeof json.exp === "number" ? json.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

export default function AdminApp() {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState("");
  const [page, setPage] = useState<AdminPage>("dashboard");
  const [loginErr, setLoginErr] = useState("");

  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Booking[] | null>(null);

  const [filter, setFilter] = useState("all");
  const [pageNum, setPageNum] = useState(1);
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [total, setTotal] = useState(0);

  const [sheet, setSheet] = useState<Booking | null>(null);
  const [sheetSaving, setSheetSaving] = useState(false);

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [range, setRange] = useState<"7d" | "30d">("7d");

  const authFetch = (path: string, opts: RequestInit = {}, tok = token) =>
    fetch(path, {
      ...opts,
      headers: {
        Authorization: "Bearer " + tok,
        "Content-Type": "application/json",
        ...(opts.headers || {}),
      },
    });

  // 初回：localStorage のトークン検証
  useEffect(() => {
    const stored = localStorage.getItem("cf_admin_token") || "";
    if (stored && tokenExpMs(stored) > Date.now()) setToken(stored);
    else if (stored) localStorage.removeItem("cf_admin_token");
    setReady(true);
  }, []);

  // ダッシュボード
  useEffect(() => {
    if (!token || page !== "dashboard") return;
    (async () => {
      const res = await authFetch("/api/admin/stats");
      const data = (await res.json()) as { stats: Stats; recent: Booking[] };
      setStats(data.stats);
      setRecent(data.recent || []);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page]);

  // 一覧
  useEffect(() => {
    if (!token || page !== "bookings") return;
    setBookings(null);
    (async () => {
      const res = await authFetch(
        `/api/admin/bookings?status=${filter}&page=${pageNum}`
      );
      const data = (await res.json()) as { bookings: Booking[]; total: number };
      setBookings(data.bookings || []);
      setTotal(data.total || 0);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, filter, pageNum]);

  // 解析
  useEffect(() => {
    if (!token || page !== "analytics") return;
    setAnalytics(null);
    (async () => {
      const res = await authFetch(`/api/admin/analytics?range=${range}`);
      const data = (await res.json()) as Analytics;
      setAnalytics(data);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, range]);

  async function doLogin(username: string, password: string) {
    setLoginErr("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as { token: string; error?: string };
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem("cf_admin_token", data.token);
      setToken(data.token);
      setPage("dashboard");
    } catch (err) {
      setLoginErr(err instanceof Error ? err.message : "ログインに失敗しました");
    }
  }

  function doLogout() {
    localStorage.removeItem("cf_admin_token");
    setToken("");
    setStats(null);
    setRecent(null);
    setBookings(null);
    setAnalytics(null);
  }

  async function saveSheet(status: string, note: string) {
    if (!sheet) return;
    setSheetSaving(true);
    await authFetch(`/api/admin/bookings/${sheet.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status, admin_note: note }),
    });
    setSheetSaving(false);
    setSheet(null);
    // 一覧/ダッシュボードを再取得
    if (page === "bookings") {
      const res = await authFetch(
        `/api/admin/bookings?status=${filter}&page=${pageNum}`
      );
      const data = (await res.json()) as { bookings: Booking[]; total: number };
      setBookings(data.bookings || []);
      setTotal(data.total || 0);
    } else {
      const res = await authFetch("/api/admin/stats");
      const data = (await res.json()) as { stats: Stats; recent: Booking[] };
      setStats(data.stats);
      setRecent(data.recent || []);
    }
  }

  if (!ready) return null;

  if (!token) return <LoginScreen error={loginErr} onSubmit={doLogin} />;

  return (
    <div className="min-h-screen bg-surface text-ink">
      <div className="grid grid-cols-[240px_1fr] max-[820px]:grid-cols-1 min-h-screen">
        <Sidebar page={page} onNavigate={setPage} onLogout={doLogout} />
        <main className="p-6 md:p-8 overflow-x-hidden">
          {page === "dashboard" && (
            <Dashboard stats={stats} recent={recent} onOpen={setSheet} />
          )}
          {page === "bookings" && (
            <BookingsTable
              bookings={bookings}
              total={total}
              filter={filter}
              page={pageNum}
              onFilter={(f) => {
                setFilter(f);
                setPageNum(1);
              }}
              onPage={setPageNum}
              onOpen={setSheet}
            />
          )}
          {page === "analytics" && (
            <AnalyticsPanel data={analytics} range={range} onRange={setRange} />
          )}
        </main>
      </div>

      <BookingSheet
        booking={sheet}
        saving={sheetSaving}
        onClose={() => setSheet(null)}
        onSave={saveSheet}
      />
    </div>
  );
}
