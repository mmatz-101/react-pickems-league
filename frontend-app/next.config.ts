import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  // Config options here
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "a.espncdn.com",
        port: "",
        pathname: "/combiner/**",
      },
    ],
  },
};

const withVercelToolbar = require("@vercel/toolbar/plugins/next")();
// Instead of module.exports = nextConfig, do this:
module.exports = withVercelToolbar(nextConfig);
