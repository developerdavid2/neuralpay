export const LANDING_THEME = {
  // Surfaces & Backgrounds
  bg: "#3E3650",
  card: "#2c2242", // Elevate/Glassmorphic cards
  popover: "#1d172e", // Dropdowns / Modals

  // Typography
  foreground: "#ffffff", // Primary headings & crisp text
  mutedForeground: "#a1a1aa", // Subtitles & secondary body copy (zinc-400 equivalent)

  // Borders & Dividers
  border: "rgba(255, 255, 255, 0.1)", // Glassmorphic borders
  borderSubtle: "rgba(255, 255, 255, 0.05)",
  borderGlow: "rgba(196, 181, 253, 0.3)", // Violet ambient border accent

  // Brand Accents
  violet400: "#c4b5fd", // Light ambient glow
  violet500: "#8b5cf6", // Primary brand accent
  violet600: "#a684ff", // Secondary canvas ring / gradient highlight
  indigo: "#6366f1", // Secondary brand accent
  indigo300: "#a78bfa", // Subtle indigo highlight

  // Status Colors (Transactions / Badges)
  emerald: "#10b981", // Positive values / Success
  orange: "#f97316", // Highlights / Alerts
} as const;

export type LandingTheme = typeof LANDING_THEME;
