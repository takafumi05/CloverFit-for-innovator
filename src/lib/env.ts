import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Cloudflare の vars/secrets（`.dev.vars` 含む）を読む。
 * OpenNext では vars/secrets は getCloudflareContext().env に載る。
 * リクエストコンテキスト外や未設定時は process.env → undefined の順でフォールバック。
 */
export function getEnv(key: string): string | undefined {
  try {
    const cf = getCloudflareContext().env as unknown as Record<string, unknown>;
    const v = cf?.[key];
    if (typeof v === "string" && v.length > 0) return v;
  } catch {
    // ビルド時などコンテキスト外
  }
  const p = process.env[key];
  return typeof p === "string" && p.length > 0 ? p : undefined;
}
