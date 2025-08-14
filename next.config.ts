import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "warcraft.wiki.gg",
      },
    ],
  },
};

export default nextConfig;
