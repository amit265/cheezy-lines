import { useColorScheme } from "react-native";

export const darkTheme = {
  // Deep Backgrounds
  BACKGROUND: "#050B14", // Deepest space blue
  DARK_INDIGO: "#081021",
  
  // Neon Accents
  NEON_PINK: "#FF007F",
  ELECTRIC_CYAN: "#00F0FF",
  BRAND_ORANGE: "#FFA500", // Main brand color but glowing
  NEON_GREEN: "#00FF66",
  
  // Glass Surfaces
  CARD_BG: "rgba(255, 255, 255, 0.05)",
  CARD_BORDER: "rgba(255, 255, 255, 0.15)",
  
  // Text
  TEXT_LIGHT: "#FFFFFF",
  TEXT_MUTED: "rgba(255, 255, 255, 0.6)",
  TEXT_DARK: "#050B14",
  TEXT: "#FFFFFF",
  MUTED: "rgba(255, 255, 255, 0.6)",
  
  // Gradients
  GRADIENT_PRIMARY: ["#FF007F", "#FFA500"], // Pink to Orange
  GRADIENT_SECONDARY: ["#00F0FF", "#081021"], // Cyan to dark

  // Standard legacy fallback if any component uses them
  FAMILY: "#4F2E2D",
  RANDOM: "#B14F0F",
  FAVOURITES: "#FFA500",
  ERROR : "#E53935",
  WARNING: "#FB8C00",
  INFO: "#00ACC1",
  SUCCESS: "#43A047",
  PRIMARY: "#FFA500", 
  SECONDARY: "#6C757D"
};

export const lightTheme = {
  // Deep Backgrounds
  BACKGROUND: "#F8F9FA", // Light clean background
  DARK_INDIGO: "#E9ECEF",
  
  // Neon Accents (Adapted for light theme)
  NEON_PINK: "#E91E63",
  ELECTRIC_CYAN: "#00BCD4",
  BRAND_ORANGE: "#F57C00", // Slightly darker orange for better contrast
  NEON_GREEN: "#4CAF50",
  
  // Glass Surfaces
  CARD_BG: "rgba(0, 0, 0, 0.03)",
  CARD_BORDER: "rgba(0, 0, 0, 0.08)",
  
  // Text
  TEXT_LIGHT: "#FFFFFF",
  TEXT_MUTED: "rgba(0, 0, 0, 0.6)",
  TEXT_DARK: "#050B14",
  TEXT: "#121212",
  MUTED: "rgba(0, 0, 0, 0.6)",
  
  // Gradients
  GRADIENT_PRIMARY: ["#E91E63", "#F57C00"], // Pink to Orange
  GRADIENT_SECONDARY: ["#00BCD4", "#E9ECEF"], // Cyan to light

  // Standard legacy fallback if any component uses them
  FAMILY: "#4F2E2D",
  RANDOM: "#B14F0F",
  FAVOURITES: "#F57C00",
  ERROR : "#E53935",
  WARNING: "#FB8C00",
  INFO: "#00ACC1",
  SUCCESS: "#43A047",
  PRIMARY: "#F57C00", 
  SECONDARY: "#6C757D"
};

export const useThemeColors = () => {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
};

// Default export is darkTheme for backwards compatibility during refactor
export default darkTheme;