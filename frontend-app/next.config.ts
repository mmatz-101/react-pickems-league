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

// The Vercel toolbar is a development convenience and should not be loaded
// during production builds. Loading it unconditionally makes the build depend
// on the toolbar's optional filesystem packages.
if (process.env.NODE_ENV === "development") {
  const withVercelToolbar = require("@vercel/toolbar/plugins/next")();
  module.exports = withVercelToolbar(nextConfig);
} else {
  module.exports = nextConfig;
}
