import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    qualities: [75, 90],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // GCS-hosted media uploads (Studio profile photos, etc.)
      { protocol: "https", hostname: "storage.googleapis.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/treasury", destination: "/treasury/foreign-exchange", permanent: true },
    ];
  },
};

export default withPayload(nextConfig);
