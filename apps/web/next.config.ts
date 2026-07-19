import { webEnv } from "@neuralpay/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  output: "standalone",

  async rewrites() {
    const serverUrl = webEnv.SERVER_URL ?? webEnv.NEXT_PUBLIC_SERVER_URL;
    return [
      {
        source: "/api/auth/:path*",
        destination: `${serverUrl}/v1/auth/:path*`,
      },
      {
        source: "/api/trpc/:path*",
        destination: `${serverUrl}/v1/trpc/:path*`,
      },
    ];
  },
};

export default nextConfig;
