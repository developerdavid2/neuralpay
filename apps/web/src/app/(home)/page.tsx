"use client";

import { Demo } from "@/components/demo";
import Header from "@/components/header";

export default function Home() {
  // const healthCheck = useQuery(trpc.healthCheck.queryOptions());

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <Header />
      <Demo />
    </div>
  );
}
