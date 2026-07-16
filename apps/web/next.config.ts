import { webEnv } from "@neuralpay/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  output: "standalone",

  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${webEnv.NEXT_PUBLIC_SERVER_URL}/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
