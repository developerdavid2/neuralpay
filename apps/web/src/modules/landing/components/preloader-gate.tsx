"use client";
import { useEffect, useState } from "react";
import Preloader from "./preloader";

export function PreloaderGate({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(true);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    document.body.style.overflow = revealed ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [revealed]);

  return (
    <>
      {mounted && (
        <Preloader
          onReveal={() => setRevealed(true)}
          onComplete={() => setMounted(false)}
        />
      )}
      <div className={revealed ? undefined : "invisible"}>{children}</div>
    </>
  );
}
