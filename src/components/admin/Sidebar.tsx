import { BrandMark } from "@/components/site/icons";

export type AdminPage = "dashboard" | "bookings" | "analytics";

const NAV: { key: AdminPage; label: string; icon: React.ReactNode }[] = [
  {
    key: "dashboard",
    label: "ダッシュボード",
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
  },
  {
    key: "bookings",
    label: "お問い合わせ",
    icon: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    key: "analytics",
    label: "アクセス解析",
    icon: (
      <>
        <path d="M3 3v18h18" />
        <rect x="7" y="12" width="3" height="6" rx="0.5" />
        <rect x="12" y="8" width="3" height="10" rx="0.5" />
        <rect x="17" y="5" width="3" height="13" rx="0.5" />
      </>
    ),
  },
];

export default function Sidebar({
  page,
  onNavigate,
  onLogout,
}: {
  page: AdminPage;
  onNavigate: (p: AdminPage) => void;
  onLogout: () => void;
}) {
  return (
    <aside className="bg-white/70 backdrop-blur-xl border-r border-line sticky top-0 h-screen flex flex-col py-5 max-[820px]:static max-[820px]:h-auto">
      <div className="px-5 pb-5 border-b border-line flex items-center gap-2">
        <BrandMark className="h-6 w-auto" />
        <span className="font-inter font-extrabold text-[16px] tracking-[-0.02em] text-ink">
          Clover<span className="text-green">Fit</span>
        </span>
        <span className="ml-auto text-[10px] font-semibold tracking-[0.1em] text-muted uppercase">
          Admin
        </span>
      </div>

      <div className="px-3 pt-4 flex-1">
        <p className="px-2 mb-2 text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
          Menu
        </p>
        <div className="flex flex-col gap-1">
          {NAV.map((n) => {
            const active = page === n.key;
            return (
              <button
                key={n.key}
                onClick={() => onNavigate(n.key)}
                className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-[6px] text-[14px] w-full text-left transition-colors ${
                  active
                    ? "bg-green-tint text-green font-semibold"
                    : "text-ink/70 hover:bg-surface hover:text-ink"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r bg-green" />
                )}
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {n.icon}
                </svg>
                {n.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-3 pt-3 border-t border-line">
        <button
          onClick={onLogout}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-[6px] text-[14px] w-full text-left text-ink/60 hover:bg-surface hover:text-ink transition-colors"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          ログアウト
        </button>
      </div>
    </aside>
  );
}
