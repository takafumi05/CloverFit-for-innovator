import Script from "next/script";

/**
 * Google Analytics（GA4）。
 * 環境変数 NEXT_PUBLIC_GA_ID（例: G-XXXXXXX）が設定されている場合のみ計測タグを出力。
 * 未設定なら何もしない（後から ID を入れるだけで有効化）。
 */
export default function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}');`}
      </Script>
    </>
  );
}
