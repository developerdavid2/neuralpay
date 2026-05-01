"use client";

import Header from "@/components/header";
import { Button } from "@neuralpay/ui/components/button";

export default function Home() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <Header />
      <Button>Hello Brother</Button>
    </div>
  );
}
