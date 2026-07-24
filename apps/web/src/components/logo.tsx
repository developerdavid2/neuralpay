"use client";

import Image from "next/image";
import Link from "next/link";
import { useSidebar } from "@neuralpay/ui/components/sidebar";
import { cn } from "@neuralpay/ui/lib/utils";
import type { Route } from "next";

interface NeuralPayLogoProps {
  /** Path relative to /public directory (default: "/assets/logos/neuralpay.svg") */
  src?: string;
  size?: number;
  className?: string;
  href?: string;
  /** Force text to show when outside of a SidebarProvider context */
  showText?: boolean;
}

export function NeuralPayLogo({
  src = "/assets/logos/neuralpay.svg",
  size = 32,
  className,
  href = "/",
  showText,
}: NeuralPayLogoProps) {
  // Safely attempt to read sidebar context
  let isExpanded = true;
  try {
    const sidebar = useSidebar();
    isExpanded = sidebar.state === "expanded";
  } catch {
    // Falls back to showText if used outside SidebarProvider
    isExpanded = showText ?? true;
  }

  const shouldDisplayText = showText !== undefined ? showText : isExpanded;

  return (
    <Link
      href={href as Route}
      className={cn(
        "flex items-center gap-2.5 px-1 py-1 rounded-lg select-none outline-none focus-visible:ring-2 focus-visible:ring-landing-violet-400 transition-opacity hover:opacity-90",
        className,
      )}
    >
      {/* Dynamic Size SVG Image Wrapper */}
      <div
        className="relative flex shrink-0 items-center justify-center"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <Image
          src={src}
          alt="NeuralPay Logo"
          width={size}
          height={size}
          priority
          className="object-contain transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Brand Text */}
      {shouldDisplayText && (
        <span className="text-[15px] font-semibold tracking-tight text-foreground transition-opacity duration-200">
          NeuralPay
        </span>
      )}
    </Link>
  );
}
