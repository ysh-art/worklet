const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const fg = require("fast-glob");

const nextConfig = {
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      exclude: /ort.bundle.min.mjs$/,
      type: "javascript/auto",
    });

    config.plugins.push(
      new CopyPlugin({
        patterns: fg.sync('**/AudioResamplerWorklet.js').map((filePath: any) => ({
          from: filePath,
          to: 'static/chunks/pages',
        })),
      })
    );


    return config;
  },
};

module.exports = nextConfig;
