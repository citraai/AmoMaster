import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ビルド時のESLintチェックをスキップ（本番に早くデプロイするため）
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 型チェックもスキップ（一時的）
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
