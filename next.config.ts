const path = require("path");

const nextConfig = {
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      exclude: /ort.bundle.min.mjs$/,
      type: "javascript/auto",
    });

    config.module.rules.push({
      test: /worklet\.ts$/,
      type: "asset/source", // Use asset/source to treat the file as raw text

    });

    return config;
  },
};

module.exports = nextConfig;
