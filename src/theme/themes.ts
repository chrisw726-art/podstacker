export type Theme = {
  appBackground: string;
  surface: string;
  surfaceRaised: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  brandPrimary: string;   // highway yellow
  brandAccent: string;    // light blue

  divider: string;
  success: string;
  danger: string;
};

export const HighwayDark: Theme = {
  appBackground: "#0B1424",
  surface: "#0F1B2F",
  surfaceRaised: "#13223A",

  textPrimary: "#F5B301",
  textSecondary: "#C9D3E0",
  textMuted: "#8FA1B8",

  brandPrimary: "#F5B301",
  brandAccent: "#2EC8FF",

  divider: "#1E2D45",
  success: "#2ECC71",
  danger: "#E74C3C"
};
