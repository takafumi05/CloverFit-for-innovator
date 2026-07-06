"use client";

import { useCallback, useEffect, useState } from "react";
import { POSITION_MAP } from "@/lib/constants";
import {
  formatDateTime,
  statusLabel,
  type Booking,
  type Stats,
} from "@/lib/format";

const STATUS_FILTERS = [
  { value: "all", label: "すべて" },
  { value: "new", label: "新規" },
  { value: "contacted", label: "連絡済み" },
  { value: "scheduled", label: "日程確定" },
  { value: "completed", label: "完了" },
  { value: "cancelled", label: "キャンセル" },
];

const STATUS_OPTIONS = STATUS_FILTERS.filter((s) => s.value !== "all");

const BADGE_CLASS: Record<string, string> = {
  new: "bg-[rgba(0,224,90,0.1)] text-accent",
  contacted: "bg-[rgba(90,150,224,0.1)] text-[#5a96e0]",
  scheduled: "bg-[rgba(224,180,90,0.1)] text-[#e0b45a]",
  completed: "bg-[rgba(150,224,90,0.1)] text-[#96e05a]",
  cancelled: "bg-[rgba(224,90,90,0.1)] text-[#e05a5a]",
};

const BORDER = "border-[#1e1e1e]";
const PAGE_LIMIT = 20;

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-inter text-[11px] font-semibold tracking-[0.05em] ${
        BADGE_CLASS[status] || ""
      }`}
    >
      {statusLabel(status)}
    </span>
  );
}

export default function AdminApp() {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState("");
  const [page, setPage] = useState<"dashboard" | "bookings">("dashboard");

  // login
  const [loginUser, setLoginUser] = useState("admin");
  const [loginPass, setLoginPass] = useState("");
  const [loginErr, setLoginErr] = useState("");

  // dashboard
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Booking[] | null>(null);

  // bookings
  const [filter, setFilter] = useState("all");
  const [pageNum, setPageNum] = useState(1);
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [total, setTotal] = useState(0);

  // modal
  const [modal, setModal] = useState<Booking | null>(null);
  const [modalStatus, setModalStatus] = useState("new");
  const [modalNote, setModalNote] = useState("");

  const authFetch = useCallback(
    (path: string, opts: RequestInit = {}, tok = token) =>
      fetch(path, {
        ...opts,
        headers: {
          Authorization: "Bearer " + tok,
          "Content-Type": "application/json",
          ...(opts.headers || {}),
        },
      }),
    [token]
  );

  const loadDashboard = useCallback(
    async (tok = token) => {
      const res = await authFetch("/api/admin/stats", {}, tok);
      const data = (await res.json()) as { stats: Stats; recent: Booking[] };
      setStats(data.stats);
      setRecent(data.recent || []);
    },
    [authFetch, token]
  );

  const loadBookings = useCallback(
    async (tok = token) => {
      setBookings(null);
      const res = await authFetch(
        `/api/admin/bookings?status=${filter}&page=${pageNum}`,
        {},
        tok
      );
      const data = (await res.json()) as { bookings: Booking[]; total: number };
      setBookings(data.bookings || []);
      setTotal(data.total || 0);
    },
    [authFetch, filter, pageNum, token]
  );

  // 初回：localStorage のトークンを検証
  useEffect(() => {
    const stored = localStorage.getItem("cf_admin_token") || "";
    if (stored) {
      try {
        const p = JSON.parse(atob(stored));
        if (p.exp > Date.now()) {
          setToken(stored);
          loadDashboard(stored);
        } else {
          localStorage.removeItem("cf_admin_token");
        }
      } catch {
        localStorage.removeItem("cf_admin_token");
      }
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ページ/フィルタ変更時に一覧を再取得
  useEffect(() => {
    if (token && page === "bookings") loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, filter, pageNum]);

  async function doLogin() {
    setLoginErr("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser, password: loginPass }),
      });
      const data = (await res.json()) as { token: string; error?: string };
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem("cf_admin_token", data.token);
      setToken(data.token);
      setPage("dashboard");
      loadDashboard(data.token);
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
  }

  function openModal(b: Booking) {
    setModal(b);
    setModalStatus(b.status);
    setModalNote(b.admin_note || "");
  }

  async function saveBooking() {
    if (!modal) return;
    await authFetch(`/api/admin/bookings/${modal.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: modalStatus, admin_note: modalNote }),
    });
    setModal(null);
    loadBookings();
  }

  if (!ready) return null;

  // ---------- ログイン画面 ----------
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className={`bg-card border ${BORDER} rounded-2xl px-12 py-14 w-full max-w-[400px]`}>
          <div className="font-inter font-extrabold text-[24px] tracking-[-0.03em] mb-2">
            CloverFit
          </div>
          <div className="text-[13px] text-ts mb-10">管理者ログイン</div>
          {loginErr && (
            <div className="bg-[rgba(224,90,90,0.1)] border border-[rgba(224,90,90,0.3)] rounded-lg px-4 py-3 text-[14px] text-[#e05a5a] mb-4">
              {loginErr}
            </div>
          )}
          <div className="flex flex-col gap-4">
            <div>
              <label className="font-inter text-[11px] font-semibold tracking-[0.1em] text-ts uppercase block mb-2">
                ユーザー名
              </label>
              <input
                type="text"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                className={`w-full bg-bg border ${BORDER} rounded-lg px-4 py-3 text-tp font-sans text-[15px] outline-none focus:border-[#333] transition-colors`}
              />
            </div>
            <div>
              <label className="font-inter text-[11px] font-semibold tracking-[0.1em] text-ts uppercase block mb-2">
                パスワード
              </label>
              <input
                type="password"
                placeholder="パスワードを入力"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") doLogin();
                }}
                className={`w-full bg-bg border ${BORDER} rounded-lg px-4 py-3 text-tp font-sans text-[15px] outline-none focus:border-[#333] transition-colors`}
              />
            </div>
            <button
              onClick={doLogin}
              className="bg-accent text-[#050505] rounded-lg py-3.5 font-sans font-bold text-[15px] cursor-pointer hover:bg-[#00c94f] transition-colors mt-2 w-full"
            >
              ログイン
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  // ---------- 管理画面 ----------
  return (
    <div className="grid grid-cols-[220px_1fr] min-h-screen max-[720px]:grid-cols-1">
      {/* サイドバー */}
      <div className={`bg-card border-r ${BORDER} py-6 flex flex-col sticky top-0 h-screen max-[720px]:static max-[720px]:h-auto`}>
        <div className={`font-inter font-extrabold text-[16px] tracking-[-0.03em] px-5 pb-6 border-b ${BORDER} mb-4`}>
          CloverFit
        </div>
        <div className="flex flex-col gap-0.5 px-2 flex-1">
          <SidebarLink
            active={page === "dashboard"}
            onClick={() => setPage("dashboard")}
            label="ダッシュボード"
            icon={
              <>
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </>
            }
          />
          <SidebarLink
            active={page === "bookings"}
            onClick={() => setPage("bookings")}
            label="申し込み一覧"
            icon={
              <>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </>
            }
          />
        </div>
        <div className={`px-2 py-4 border-t ${BORDER} mt-auto`}>
          <SidebarLink
            active={false}
            onClick={doLogout}
            label="ログアウト"
            icon={
              <>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </>
            }
          />
        </div>
      </div>

      {/* メイン */}
      <div className="p-8 overflow-y-auto">
        {page === "dashboard" ? (
          <>
            <div className="mb-8">
              <div className="font-inter font-bold text-[22px] tracking-[-0.02em] text-tp mb-1.5">
                ダッシュボード
              </div>
              <div className="text-[14px] text-ts">申し込み状況の概要</div>
            </div>

            <div className="grid grid-cols-5 gap-2.5 mb-8 max-[1200px]:grid-cols-3">
              {stats ? (
                <>
                  <StatCard label="総申し込み" num={stats.total} accent />
                  <StatCard label="新規" num={stats.new_count ?? 0} />
                  <StatCard label="連絡済み" num={stats.contacted_count ?? 0} />
                  <StatCard label="日程確定" num={stats.scheduled_count ?? 0} />
                  <StatCard label="完了" num={stats.completed_count ?? 0} />
                </>
              ) : (
                <div className="text-center py-12 text-ts text-[14px]">
                  読み込み中...
                </div>
              )}
            </div>

            <div className="mb-8">
              <div className="font-inter font-bold text-[16px] tracking-[-0.02em] text-tp">
                最近の申し込み
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              {recent === null ? (
                <div className="text-center py-12 text-ts text-[14px]">
                  読み込み中...
                </div>
              ) : recent.length === 0 ? (
                <div className="text-center py-16 text-ts">
                  申し込みはまだありません
                </div>
              ) : (
                recent.map((b) => (
                  <div
                    key={b.id}
                    className={`bg-bg border ${BORDER} rounded-[10px] px-5 py-4 flex items-center justify-between gap-4`}
                  >
                    <div>
                      <div className="font-medium text-[15px] mb-0.5">
                        {b.name}
                      </div>
                      <div className="text-[13px] text-ts">{b.email}</div>
                    </div>
                    <StatusBadge status={b.status} />
                    <div className="font-inter text-[12px] text-ts">
                      {formatDateTime(b.created_at)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <div className="mb-8">
              <div className="font-inter font-bold text-[22px] tracking-[-0.02em] text-tp mb-1.5">
                申し込み一覧
              </div>
              <div className="text-[14px] text-ts">
                体験セッション申し込みの管理
              </div>
            </div>

            <div className="flex gap-2 mb-5 flex-wrap">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => {
                    setFilter(f.value);
                    setPageNum(1);
                  }}
                  className={`border rounded-lg px-4 py-2 font-inter text-[12px] font-medium cursor-pointer transition ${
                    filter === f.value
                      ? "bg-[rgba(0,224,90,0.1)] border-[rgba(0,224,90,0.3)] text-accent"
                      : `bg-card ${BORDER} text-ts hover:text-tp hover:border-[#333]`
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className={`bg-card border ${BORDER} rounded-xl overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className={`border-b ${BORDER}`}>
                    <tr>
                      {["名前", "立場", "会社・事業", "ステータス", "申し込み日", ""].map(
                        (h, i) => (
                          <th
                            key={i}
                            className="px-5 py-3.5 text-left font-inter text-[11px] font-semibold tracking-[0.1em] text-ts uppercase"
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
                        <td colSpan={6} className="text-center py-12 text-ts text-[14px]">
                          読み込み中...
                        </td>
                      </tr>
                    ) : bookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-ts">
                          申し込みがありません
                        </td>
                      </tr>
                    ) : (
                      bookings.map((b) => (
                        <tr
                          key={b.id}
                          className={`border-b ${BORDER} last:border-b-0 hover:bg-white/[0.02] transition-colors`}
                        >
                          <td className="px-5 py-4">
                            <div className="font-medium text-[14px] text-tp">
                              {b.name}
                            </div>
                            <div className="text-ts text-[13px]">{b.email}</div>
                          </td>
                          <td className="px-5 py-4 text-[14px] text-tp">
                            {POSITION_MAP[b.position] || b.position}
                          </td>
                          <td className="px-5 py-4 text-[14px] text-tp">
                            {b.company || "—"}
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={b.status} />
                          </td>
                          <td className="px-5 py-4 text-[14px] text-tp">
                            {formatDateTime(b.created_at)}
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => openModal(b)}
                              className={`bg-transparent border ${BORDER} rounded-md px-3 py-1.5 text-[12px] text-ts cursor-pointer transition hover:border-[#444] hover:text-tp`}
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
                <div className={`flex items-center justify-end gap-2 px-5 py-4 border-t ${BORDER}`}>
                  <span className="text-[13px] text-ts">
                    全{total}件 / {pageNum}/{totalPages}ページ
                  </span>
                  <button
                    onClick={() => setPageNum((p) => Math.max(1, p - 1))}
                    disabled={pageNum <= 1}
                    className={`bg-transparent border ${BORDER} rounded-md px-3 py-1.5 text-[13px] text-ts cursor-pointer transition hover:text-tp hover:border-[#333] disabled:opacity-30 disabled:cursor-not-allowed`}
                  >
                    前へ
                  </button>
                  <button
                    onClick={() => setPageNum((p) => Math.min(totalPages, p + 1))}
                    disabled={pageNum >= totalPages}
                    className={`bg-transparent border ${BORDER} rounded-md px-3 py-1.5 text-[13px] text-ts cursor-pointer transition hover:text-tp hover:border-[#333] disabled:opacity-30 disabled:cursor-not-allowed`}
                  >
                    次へ
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 詳細モーダル */}
      {modal && (
        <div
          className="fixed inset-0 bg-black/80 z-[500] flex items-center justify-center p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div className={`bg-card border ${BORDER} rounded-2xl w-full max-w-[560px] p-10 max-h-[90vh] overflow-y-auto`}>
            <div className="font-inter font-bold text-[18px] mb-6">
              申し込み詳細
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <ModalField label="名前" value={modal.name} />
              <ModalField
                label="立場"
                value={POSITION_MAP[modal.position] || modal.position}
              />
              <ModalField label="メール" value={modal.email} />
              <ModalField label="電話" value={modal.phone || "—"} />
              <ModalField label="会社・事業" value={modal.company || "—"} full />
              <ModalField
                label="期待すること"
                value={modal.message || "—"}
                full
              />
              <ModalField
                label="申し込み日"
                value={formatDateTime(modal.created_at)}
                full
              />
            </div>

            <div className="mb-4">
              <label className="font-inter text-[10px] font-semibold tracking-[0.1em] text-ts uppercase block mb-1.5">
                ステータス
              </label>
              <select
                value={modalStatus}
                onChange={(e) => setModalStatus(e.target.value)}
                className={`w-full bg-bg border ${BORDER} rounded-lg px-3.5 py-2.5 text-tp font-sans text-[14px] outline-none appearance-none`}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-inter text-[10px] font-semibold tracking-[0.1em] text-ts uppercase block mb-1.5">
                管理メモ
              </label>
              <textarea
                value={modalNote}
                onChange={(e) => setModalNote(e.target.value)}
                placeholder="連絡日時、メモなど..."
                className={`w-full bg-bg border ${BORDER} rounded-lg px-3.5 py-2.5 text-tp font-sans text-[14px] outline-none resize-y min-h-[80px]`}
              />
            </div>
            <div className="flex gap-2.5 justify-end mt-6">
              <button
                onClick={() => setModal(null)}
                className={`bg-transparent border ${BORDER} rounded-lg px-5 py-2.5 text-ts cursor-pointer text-[14px]`}
              >
                キャンセル
              </button>
              <button
                onClick={saveBooking}
                className="bg-accent border-none rounded-lg px-6 py-2.5 text-[#050505] font-bold cursor-pointer text-[14px]"
              >
                保存する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarLink({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] no-underline cursor-pointer border-none bg-transparent w-full text-left transition-colors hover:bg-white/5 hover:text-tp ${
        active ? "bg-white/5 text-accent" : "text-ts"
      }`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        {icon}
      </svg>
      {label}
    </button>
  );
}

function StatCard({
  label,
  num,
  accent,
}: {
  label: string;
  num: number;
  accent?: boolean;
}) {
  return (
    <div className={`bg-card border ${BORDER} rounded-xl px-5 py-6`}>
      <span className="font-inter text-[10px] font-semibold tracking-[0.15em] text-ts uppercase block mb-3">
        {label}
      </span>
      <span
        className={`font-inter font-extrabold text-[32px] tracking-[-0.03em] block ${
          accent ? "text-accent" : "text-tp"
        }`}
      >
        {num}
      </span>
    </div>
  );
}

function ModalField({
  label,
  value,
  full,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="font-inter text-[10px] font-semibold tracking-[0.1em] text-ts uppercase block mb-1.5">
        {label}
      </label>
      <p className="text-[14px] text-tp leading-[1.6] break-words">{value}</p>
    </div>
  );
}
