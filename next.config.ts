import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "warcraft.wiki.gg",
      },
      {
        protocol: "https",
        hostname: "at-cdn-s03.audiotool.com",
      },
    ],
  },
};

export default nextConfig;
