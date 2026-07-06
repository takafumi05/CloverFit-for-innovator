import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 画像は CSS filter / object-position を多用するため最適化は無効（素の <img> で扱う）
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

// Cloudflare バインディング（D1 等）をローカル開発（next dev）でも利用可能にする
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
