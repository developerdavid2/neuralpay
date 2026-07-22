"use client";

import { useEffect, useState, type ReactNode } from "react";
import GradualBlurMemo from "@neuralpay/ui/components/react-bits/gradual-blur";

export default function ViewportBlurProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [showBlur, setShowBlur] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting);
        setShowBlur(isVisible);
      },
      { threshold: 0.15 },
    );

    const targetSections = document.querySelectorAll("[data-blur-section]");
    targetSections.forEach((sec) => observer.observe(sec));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {children}

      {/* Fixed Blur Overlay Layer */}
      <div
        aria-hidden="true"
        className={`fixed bottom-0 left-0 right-0 z-30 pointer-events-none transition-opacity duration-500 ${
          showBlur ? "opacity-100" : "opacity-0"
        }`}
      >
        <GradualBlurMemo
          target="parent"
          position="bottom"
          height="20rem"
          strength={1.5}
          divCount={6}
          curve="ease-out"
          opacity={1}
        />
      </div>
    </>
  );
}
