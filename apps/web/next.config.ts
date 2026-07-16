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
        destination: `${webEnv.SERVER_URL}/v1/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
