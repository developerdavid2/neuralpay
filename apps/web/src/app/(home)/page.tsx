"use client";

import Header from "@/components/header";
import { Button } from "@neuralpay/ui/components/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <Header />
      <Button onClick={() => router.push("/dashboard")}>Hello Brother</Button>
    </div>
  );
}
