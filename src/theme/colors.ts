export const colors = {
  // Base colors
  background: "#0D0D0D",
  card: "#141414",

  // Primary & Accent
  primary: "#0FA958",
  primaryLight: "#12C26A",
  primaryDark: "#0D8A48",
  accent: "#D10E0E",
  accentLight: "#E63939",

  // Text colors
  text: "#EAEAEA",
  mutedText: "#9CA3AF",
  dimmedText: "#6B7280",

  // UI elements
  border: "#1F1F1F",
  borderLight: "#2A2A2A",
  shadow: "rgba(0, 0, 0, 0.25)",
  tabInactive: "#6B6B6B",

  // Semantic colors
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",

  // Glassmorphism & Overlays
  glass: "rgba(255, 255, 255, 0.05)",
  glassStrong: "rgba(255, 255, 255, 0.1)",
  overlay: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(0, 0, 0, 0.3)",

  // Gradients (for LinearGradient)
  gradientPrimary: ["#0FA958", "#12C26A"],
  gradientDark: ["#0D0D0D", "#0A0A0A", "#0D0D0D"],
  gradientCard: ["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.02)"],
  gradientPrimarySubtle: ["rgba(15, 169, 88, 0.15)", "rgba(15, 169, 88, 0.05)"],
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