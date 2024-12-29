import { NextConfig } from "next";
import WorkerUrlPlugin from "worker-url/plugin";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      exclude: /ort.bundle.min.mjs$/,
      type: "javascript/auto",
    });

    config.plugins.push(new WorkerUrlPlugin());

    return config;
  },
};

export default nextConfig;
