const path = require("path");

const nextConfig = {
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      exclude: /ort.bundle.min.mjs$/,
      type: "javascript/auto",
    });

    config.module.parser = {
      ...config.module.parser,
      javascript: {
        ...config.module.parser?.javascript,
        worker: ["AudioWorklet from audio-worklet", "..."],
      },
    };

    return config;
  },
};

module.exports = nextConfig;
