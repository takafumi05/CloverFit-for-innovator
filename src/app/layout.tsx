import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "600", "800"],
  variable: "--ff-inter",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["300", "500", "700", "900"],
  variable: "--ff-noto",
  display: "swap",
  preload: false,
});

const SITE_URL = "https://clover-fit.com";
const OG_IMAGE = `${SITE_URL}/images/training-bg.jpg`;
const TITLE =
  "CloverFit（クローバーフィット）| 起業家・経営者のための60分フィジカル×メンタルトレーニング";
const DESCRIPTION =
  "CloverFit（クローバーフィット）は起業家・経営者限定のプログラム。身体・心・仲間が60分で揃うクローズドコミュニティ。慶應義塾大学名誉教授監修のWell-being研究に基づくメンタルケア×機能的トレーニング。まずは体験予約から。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "クローバーフィット",
    "CloverFit",
    "起業家 トレーニング",
    "経営者 メンタルヘルス",
    "起業家 フィットネス",
    "経営者 ジム",
    "Well-being",
    "メンタルケア",
    "起業家 コミュニティ",
    "経営者 健康",
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
    description:
      "起業家・経営者限定。身体・心・仲間が60分で揃うクローズドプログラム。慶應義塾大学名誉教授監修。まずは体験予約から。",
    type: "website",
    url: SITE_URL,
    siteName: "CloverFit",
    locale: "ja_JP",
    images: [{ url: OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description:
      "起業家・経営者限定。身体・心・仲間が60分で揃うクローズドプログラム。慶應義塾大学名誉教授監修。",
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
