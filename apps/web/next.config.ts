import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  output: "standalone",

  async rewrites() {
    const serverUrl =
      process.env.SERVER_URL ?? process.env.NEXT_PUBLIC_SERVER_URL;
    return [
      {
        source: "/api/auth/:path*",
        destination: `${serverUrl}/v1/auth/:path*`,
      },
      {
        source: "/api/trpc/:path*", // ✅ new
        destination: `${serverUrl}/v1/trpc/:path*`,
      },
    ];
  },
};

export default nextConfig;
