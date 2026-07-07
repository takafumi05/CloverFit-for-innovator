import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--ff-inter",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--ff-noto",
  display: "swap",
  preload: false,
});

const SITE_URL = "https://clover-fit.com";
const OG_IMAGE = `${SITE_URL}/images/cloverfit-logo.png`;
const TITLE =
  "CloverFit｜社員の心身コンディションを可視化する法人向けウェルビーイングプログラム";
const DESCRIPTION =
  "CloverFitは、心拍測定と運動を組み合わせ、社員の疲労・回復力・集中状態を可視化する法人向けウェルビーイングプログラムです。社内ジム不要、会議室やラウンジで実施可能。まずは無料体験会から。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "法人向け フィットネス",
    "健康経営 福利厚生",
    "社員 健康施策",
    "オフィス フィットネス",
    "社内イベント 健康",
    "ウェルビーイング 法人",
    "社員 コンディショニング",
    "社内ジム 活用",
    "福利厚生 運動",
    "営業組織 コンディショニング",
  ],
  authors: [{ name: "CloverFit" }],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  icons: { icon: "/images/cloverfit-logo.png" },
  verification: {
    google: "0LwmPnfdycsnv-4ZoPs4T-J6Cykugg-2k_hv1JD8jEY",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: SITE_URL,
    siteName: "CloverFit",
    locale: "ja_JP",
    images: [{ url: OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${inter.variable} ${notoSansJP.variable}`}>
      <body>{children}</body>
    </html>
  );
}
