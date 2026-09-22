import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "covers.openlibrary.org" },
      {
        protocol: "https",
        hostname: "pvpw46xmctnpvwhi.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
