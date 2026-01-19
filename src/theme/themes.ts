export interface Theme {
  appBackground: string;
  surface: string;
  surfaceVariant: string;
  brandPrimary: string;
  brandSecondary: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  divider: string;
  error: string;
  success: string;
}

export const themes: Record<string, Theme> = {
  default: {
    appBackground: "#F5F7FB",
    surface: "#ffffff",
    surfaceVariant: "#f0f4f8",
    brandPrimary: "#132043",
    brandSecondary: "#22B8A8",
    textPrimary: "#111827",
    textSecondary: "#6B7280",
    textTertiary: "#9CA3AF",
    divider: "#D1D5DB",
    error: "#FF6B6B",
    success: "#22B8A8",
  },
      dark: {
    appBackground: "#1b1104",           // Deep black background
    surface: "#492b0646",                 // Slightly lighter cards/surfaces
    surfaceVariant: "#2a2a2a",          // Hover states, secondary surfaces
    brandPrimary: "#FFD700",            // Highway yellow for nav tabs
    brandSecondary: "#FFA500",          // Orange for secondary actions
    textPrimary: "#ffffff",             // Pure white for podcast titles
    textSecondary: "#cccccc",           // Light gray for podcast source (was too dark)
    textTertiary: "#808080",            // Medium gray for downloaded episodes
    divider: "#2a2a2a",                 // Subtle dividers
    error: "#ff4444",                   // Red for errors
    success: "#FFD700",                 // Yellow for success states
  },
  


  light: {
    appBackground: "#f5f5f5",
    surface: "#ffffff",
    surfaceVariant: "#f0f0f0",
    brandPrimary: "#6200ee",
    brandSecondary: "#018786",
    textPrimary: "#000000",
    textSecondary: "#666666",
    textTertiary: "#999999",
    divider: "#e0e0e0",
    error: "#b00020",
    success: "#018786",
  },
  midnight: {
    appBackground: "#0d1117",
    surface: "#161b22",
    surfaceVariant: "#21262d",
    brandPrimary: "#58a6ff",
    brandSecondary: "#79c0ff",
    textPrimary: "#c9d1d9",
    textSecondary: "#8b949e",
    textTertiary: "#6e7681",
    divider: "#30363d",
    error: "#f85149",
    success: "#56d364",
  },
  sunset: {
    appBackground: "#1a1625",
    surface: "#2d2438",
    surfaceVariant: "#3d3249",
    brandPrimary: "#ff6b9d",
    brandSecondary: "#ffa07a",
    textPrimary: "#ffd7e6",
    textSecondary: "#c9a3d1",
    textTertiary: "#9d7ba8",
    divider: "#4a3d5c",
    error: "#ff6b9d",
    success: "#a8e6cf",
  },
  ocean: {
    appBackground: "#0a1929",
    surface: "#1a2942",
    surfaceVariant: "#2a3f5f",
    brandPrimary: "#3399ff",
    brandSecondary: "#00bcd4",
    textPrimary: "#e3f2fd",
    textSecondary: "#90caf9",
    textTertiary: "#64b5f6",
    divider: "#2a4f7f",
    error: "#ff5252",
    success: "#00e676",
  },

  automotive: {
    appBackground: "#0a0a0a",
    surface: "#1a1a1a",
    surfaceVariant: "#252525",
    brandPrimary: "#00d4ff",
    brandSecondary: "#ff9500",
    textPrimary: "#ffffff",
    textSecondary: "#b8c5d0",
    textTertiary: "#6b7785",
    divider: "#2a2a2a",
    error: "#ff3b30",
    success: "#30d158",
  },

};
