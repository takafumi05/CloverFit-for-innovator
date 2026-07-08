// 依存を増やさない軽量 User-Agent パーサ（粗いバケット判定）
export type UaInfo = {
  device: "mobile" | "tablet" | "desktop";
  browser: string;
  os: string;
};

export function parseUserAgent(ua: string | null | undefined): UaInfo {
  const s = ua || "";

  // device
  let device: UaInfo["device"] = "desktop";
  if (/ipad|tablet|(android(?!.*mobile))|kindle|silk|playbook/i.test(s)) {
    device = "tablet";
  } else if (/mobi|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(s)) {
    device = "mobile";
  }

  // os
  let os = "Other";
  if (/windows nt/i.test(s)) os = "Windows";
  else if (/iphone|ipad|ipod/i.test(s)) os = "iOS";
  else if (/mac os x|macintosh/i.test(s)) os = "macOS";
  else if (/android/i.test(s)) os = "Android";
  else if (/cros/i.test(s)) os = "ChromeOS";
  else if (/linux/i.test(s)) os = "Linux";

  // browser（判定順が重要）
  let browser = "Other";
  if (/edg\//i.test(s)) browser = "Edge";
  else if (/opr\/|opera/i.test(s)) browser = "Opera";
  else if (/(chrome|crios)\//i.test(s)) browser = "Chrome";
  else if (/(firefox|fxios)\//i.test(s)) browser = "Firefox";
  else if (/safari/i.test(s) && /version\//i.test(s)) browser = "Safari";

  return { device, browser, os };
}
