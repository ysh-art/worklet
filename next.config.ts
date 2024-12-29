const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      exclude: /ort.bundle.min.mjs$/,
      type: "javascript/auto",
    });

    config.module.rules.push({
      test: /\.audioWorklet\.js$/, // Matches files ending with .worklet.js
      use: { loader: 'worklet-loader' }, // Specifies the loader to use
    });

    return config;
  },
};

module.exports = nextConfig;
