import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// ISR/インクリメンタルキャッシュは不要（実質 静的LP + API）のため incrementalCache は未設定。
// 必要になれば r2IncrementalCache 等をここで有効化する。
export default defineCloudflareConfig();
