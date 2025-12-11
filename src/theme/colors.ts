export const colors = {
  // Base colors (2025 Enhanced)
  background: "#0A0A0A",
  backgroundElevated: "#141414",
  backgroundSubtle: "#0D0D0D",
  card: "#141414",

  // Primary & Accent
  primary: "#0FA958",
  primaryLight: "#12C26A",
  primaryDark: "#0D8A48",
  primaryGlow: "rgba(15, 169, 88, 0.25)",
  accent: "#D10E0E",
  accentLight: "#E63939",
  accentGlow: "rgba(209, 14, 14, 0.25)",

  // Text colors (2025 Refined)
  white: "#FFFFFF",
  text: "#F5F5F5",
  textSecondary: "#A1A1A6",
  textTertiary: "#6E6E73",
  textQuaternary: "#48484A",
  mutedText: "#9CA3AF",
  dimmedText: "#6B7280",

  // UI elements
  border: "rgba(255, 255, 255, 0.06)",
  borderHeavy: "rgba(255, 255, 255, 0.12)",
  borderLight: "#2A2A2A",
  shadow: "rgba(0, 0, 0, 0.25)",
  shadowSoft: "rgba(0, 0, 0, 0.4)",
  shadowMedium: "rgba(0, 0, 0, 0.6)",
  shadowHeavy: "rgba(0, 0, 0, 0.8)",
  tabInactive: "#6B6B6B",

  // Semantic colors
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",

  // Glassmorphism & Overlays (2025 Premium)
  cardPrimary: "rgba(20, 20, 20, 0.85)",
  cardHero: "rgba(24, 24, 24, 0.90)",
  cardSubtle: "rgba(18, 18, 18, 0.75)",
  glassFrost: "rgba(255, 255, 255, 0.03)",
  glassStroke: "rgba(255, 255, 255, 0.08)",
  glass: "rgba(255, 255, 255, 0.05)",
  glassStrong: "rgba(255, 255, 255, 0.1)",
  overlay: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(0, 0, 0, 0.3)",

  // Gradients (for LinearGradient) - as const for tuple type
  gradientPrimary: ["#0FA958", "#12C26A"] as const,
  gradientDark: ["#0D0D0D", "#0A0A0A", "#0D0D0D"] as const,
  gradientCard: ["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.02)"] as const,
  gradientPrimarySubtle: ["rgba(15, 169, 88, 0.15)", "rgba(15, 169, 88, 0.05)"] as const,
  gradientAccentSubtle: ["rgba(209, 14, 14, 0.15)", "rgba(15, 169, 88, 0.15)"] as const,
  gradientHero: ["rgba(10, 10, 10, 0.3)", "rgba(10, 10, 10, 0.85)"] as const,
  gradientTextHero: ["#F5F5F5", "#A1A1A6"] as const,
};

export type ColorName = keyof typeof colors;

// Export gradient presets as arrays for easy use
export const gradients = {
  primary: colors.gradientPrimary,
  dark: colors.gradientDark,
  card: colors.gradientCard,
  primarySubtle: colors.gradientPrimarySubtle,
};

// Shadow presets for consistent elevation
export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  primaryGlow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
};