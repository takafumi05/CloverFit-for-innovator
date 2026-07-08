"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const GREEN = "#16a34a";
const TRACK = "#eef2f0";
const LINE = "#e4eae6";
const INK = "#14201a";
const MUTED = "#5b6b63";
const FONT = "var(--ff-inter), var(--ff-noto), sans-serif";

const DEVICE_COLORS: Record<string, string> = {
  mobile: GREEN,
  desktop: "#3b82f6",
  tablet: "#f59e0b",
};
const DEVICE_LABELS: Record<string, string> = {
  mobile: "モバイル",
  desktop: "デスクトップ",
  tablet: "タブレット",
};

const tooltip = {
  contentStyle: {
    fontFamily: FONT,
    fontSize: 12,
    borderRadius: 8,
    border: `1px solid ${LINE}`,
    boxShadow: "0 8px 24px rgba(20,32,26,0.10)",
    padding: "8px 10px",
  },
  labelStyle: { color: INK, fontWeight: 600, marginBottom: 2 },
  itemStyle: { color: MUTED },
  cursor: { fill: "rgba(22,163,74,0.06)" },
};

function shortDay(d: string): string {
  const m = /\d{4}-(\d{2})-(\d{2})/.exec(d);
  return m ? `${Number(m[1])}/${Number(m[2])}` : d;
}

function Empty({ label = "データなし" }: { label?: string }) {
  return (
    <div className="text-[13px] text-muted py-8 text-center">{label}</div>
  );
}

export function TimeSeriesChart({
  data,
}: {
  data: { day: string; count: number }[];
}) {
  if (!data.length) return <Empty />;
  const d = data.map((x) => ({ ...x, label: shortDay(x.day) }));
  return (
    <div style={{ fontFamily: FONT }} className="w-full h-[190px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={d} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="cfArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GREEN} stopOpacity={0.24} />
              <stop offset="100%" stopColor={GREEN} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={TRACK} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: MUTED }}
            tickLine={false}
            axisLine={{ stroke: LINE }}
            interval="preserveStartEnd"
            minTickGap={18}
          />
          <YAxis
            tick={{ fontSize: 10, fill: MUTED }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={30}
          />
          <Tooltip {...tooltip} />
          <Area
            type="monotone"
            dataKey="count"
            name="PV"
            stroke={GREEN}
            strokeWidth={2}
            fill="url(#cfArea)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({
  data,
}: {
  data: { device: string; count: number }[];
}) {
  if (!data.length) return <Empty />;
  const d = data.map((x) => ({
    key: x.device,
    name: DEVICE_LABELS[x.device] || x.device,
    value: x.count,
  }));
  const total = d.reduce((a, x) => a + x.value, 0);
  return (
    <div style={{ fontFamily: FONT }} className="flex items-center gap-5">
      <div className="relative w-[150px] h-[150px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={d}
              dataKey="value"
              nameKey="name"
              innerRadius={48}
              outerRadius={68}
              paddingAngle={2}
              stroke="none"
            >
              {d.map((x) => (
                <Cell key={x.key} fill={DEVICE_COLORS[x.key] || "#9ca3af"} />
              ))}
            </Pie>
            <Tooltip {...tooltip} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-inter font-extrabold text-[20px] text-ink leading-none">
            {total}
          </span>
          <span className="text-[10px] text-muted">PV</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {d.map((x) => (
          <div key={x.key} className="flex items-center gap-2 text-[12.5px]">
            <span
              className="w-2.5 h-2.5 rounded-[3px] shrink-0"
              style={{ background: DEVICE_COLORS[x.key] || "#9ca3af" }}
            />
            <span className="text-ink w-[80px]">{x.name}</span>
            <span className="text-muted tabular-nums">
              {x.value}（{total ? Math.round((x.value / total) * 100) : 0}%）
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HBar({
  data,
  fmt,
  emptyLabel,
}: {
  data: { label: string; value: number }[];
  fmt?: (v: number) => string;
  emptyLabel?: string;
}) {
  if (!data.length) return <Empty label={emptyLabel} />;
  const height = Math.max(90, data.length * 34 + 8);
  const labelFmt = (v: number | string) =>
    fmt ? fmt(Number(v)) : String(v);
  return (
    <div style={{ fontFamily: FONT }} className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
          barCategoryGap={9}
        >
          <CartesianGrid horizontal={false} stroke={TRACK} />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            width={116}
            tick={{ fontSize: 11.5, fill: INK }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip {...tooltip} formatter={(v) => [labelFmt(v as number), "値"]} />
          <Bar dataKey="value" fill={GREEN} radius={[0, 4, 4, 0]} barSize={14}>
            <LabelList
              dataKey="value"
              position="right"
              formatter={(v) => labelFmt(v as number)}
              style={{ fontSize: 11, fill: MUTED }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export const SECTION_LABELS: Record<string, string> = {
  top: "トップ",
  hero: "ヒーロー",
  problem: "課題",
  about: "CloverFitとは",
  supervisor: "監修",
  features: "特徴",
  flow: "実施フロー",
  score: "スコア",
  benefits: "導入メリット",
  conditions: "実施条件",
  pricing: "料金",
  faq: "FAQ",
  contact: "お問い合わせ",
};

// Cloudflare の region（英語）→ 日本語の都道府県。未知はそのまま返す。
const REGION_JP: Record<string, string> = {
  Hokkaido: "北海道",
  Aomori: "青森県",
  Iwate: "岩手県",
  Miyagi: "宮城県",
  Akita: "秋田県",
  Yamagata: "山形県",
  Fukushima: "福島県",
  Ibaraki: "茨城県",
  Tochigi: "栃木県",
  Gunma: "群馬県",
  Saitama: "埼玉県",
  Chiba: "千葉県",
  Tokyo: "東京都",
  Kanagawa: "神奈川県",
  Niigata: "新潟県",
  Toyama: "富山県",
  Ishikawa: "石川県",
  Fukui: "福井県",
  Yamanashi: "山梨県",
  Nagano: "長野県",
  Gifu: "岐阜県",
  Shizuoka: "静岡県",
  Aichi: "愛知県",
  Mie: "三重県",
  Shiga: "滋賀県",
  Kyoto: "京都府",
  Osaka: "大阪府",
  Hyogo: "兵庫県",
  Nara: "奈良県",
  Wakayama: "和歌山県",
  Tottori: "鳥取県",
  Shimane: "島根県",
  Okayama: "岡山県",
  Hiroshima: "広島県",
  Yamaguchi: "山口県",
  Tokushima: "徳島県",
  Kagawa: "香川県",
  Ehime: "愛媛県",
  Kochi: "高知県",
  Fukuoka: "福岡県",
  Saga: "佐賀県",
  Nagasaki: "長崎県",
  Kumamoto: "熊本県",
  Oita: "大分県",
  Miyazaki: "宮崎県",
  Kagoshima: "鹿児島県",
  Okinawa: "沖縄県",
};

export function regionLabel(r: string): string {
  return REGION_JP[r] || r;
}
