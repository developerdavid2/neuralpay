// packages/ui/lib/parse-user-agent.ts
import Bowser from "bowser";
import { Chrome, Safari, Firefox, BraveBrowser } from "@thesvg/react";
import { Laptop, Smartphone, Tablet, Globe } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

// Map Bowser's browser-name strings (lowercased) to a thesvg brand icon.
// Add more entries here as you confirm the export names exist in @thesvg/react
// (e.g. Edge, Opera) — check thesvg.org before assuming a name.
const BROWSER_ICONS: Record<string, IconComponent> = {
  chrome: Chrome,
  safari: Safari,
  firefox: Firefox,
  "brave browser": BraveBrowser,
};

export function parseUserAgent(userAgent: string | null) {
  if (!userAgent) {
    return { label: "Unknown device", icon: Globe, platformIcon: Laptop };
  }

  const parser = Bowser.getParser(userAgent);
  const browser = parser.getBrowserName() || "Unknown browser";
  const os = parser.getOSName() || "Unknown OS";
  const platformType = parser.getPlatformType(); // "mobile" | "tablet" | "desktop"

  const icon = BROWSER_ICONS[browser.toLowerCase()] ?? Globe; // demo/fallback icon

  const platformIcon =
    platformType === "mobile"
      ? Smartphone
      : platformType === "tablet"
        ? Tablet
        : Laptop;

  return { label: `${browser} on ${os}`, icon, platformIcon };
}
