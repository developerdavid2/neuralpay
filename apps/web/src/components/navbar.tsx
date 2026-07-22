"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  return (
    <>
      {/* Header Bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-6 py-5 md:px-12 transition-all duration-300 ${
          isScrolled && !isOpen
            ? "bg-[#151515]/60 backdrop-blur-xl border-b border-white/10 shadow-lg"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <span className="font-display text-xl font-bold tracking-wider text-white">
          NEURAL<span className="text-[#C4B5FD]">PAY</span>
        </span>

        {/* Menu Toggle Button (Stays above the full-screen overlay) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
          className="relative z-[70] flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-widest text-white backdrop-blur-md transition hover:bg-white/20 border border-white/10"
        >
          <span>{isOpen ? "Close" : "Menu"}</span>
          <div className="flex flex-col gap-1 w-4">
            <span
              className={`h-0.5 w-full bg-white transition-transform duration-300 ${
                isOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            />
            <span
              className={`h-0.5 w-full bg-white transition-opacity duration-300 ${
                isOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-0.5 w-full bg-white transition-transform duration-300 ${
                isOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            />
          </div>
        </button>
      </header>

      {/* Full-Screen Menu Viewport Overlay */}
      <div
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-[50] flex flex-col justify-between bg-[#151515]/90 p-8 md:p-16 backdrop-blur-3xl transition-all duration-500 ease-in-out ${
          isOpen
            ? "opacity-100 pointer-events-auto scale-100"
            : "opacity-0 pointer-events-none scale-98"
        }`}
      >
        <div className="mt-24 flex flex-col gap-6">
          {[
            "Platform",
            "Social Settlement",
            "Analytics",
            "Security",
            "Contact",
          ].map((item, idx) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setIsOpen(false)}
              className="font-display text-4xl md:text-7xl font-bold uppercase tracking-tight text-white/40 hover:text-[#C4B5FD] transition-all duration-300 hover:translate-x-3"
            >
              0{idx + 1}. {item}
            </a>
          ))}
        </div>

        <div className="flex justify-between border-t border-white/10 pt-6 text-sm text-white/50 font-mono">
          <span>NEURALPAY INC © 2026</span>
          <span>OPEN BANKING INTELLIGENCE</span>
        </div>
      </div>
    </>
  );
}
