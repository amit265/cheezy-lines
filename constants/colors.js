import { useColorScheme } from "react-native";
import { useContext } from "react";
import { themeContext } from "../context/AppContext";

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
  BACKGROUND: "#FDE9B3", // Light clean background
  DARK_INDIGO: "#E9ECEF",
  
  // Neon Accents (Adapted for light theme)
  NEON_PINK: "#EE5242",
  ELECTRIC_CYAN: "#00ACC1",
  BRAND_ORANGE: "#EDAD53", 
  NEON_GREEN: "#43A047",
  
  // Glass Surfaces (Solid in light theme for visibility)
  CARD_BG: "#FFFFFF",
  CARD_BORDER: "rgba(93, 64, 55, 0.15)",
  
  // Text
  TEXT_LIGHT: "#FFFFFF",
  TEXT_MUTED: "rgba(93, 64, 55, 0.6)",
  TEXT_DARK: "#050B14",
  TEXT: "#5D4037",
  MUTED: "rgba(93, 64, 55, 0.6)",
  
  // Gradients
  GRADIENT_PRIMARY: ["#EE5242", "#EDAD53"], // Pink to Orange
  GRADIENT_SECONDARY: ["#00ACC1", "#E9ECEF"], // Cyan to light

  // Standard legacy fallback if any component uses them
  FAMILY: "#4F2E2D",
  RANDOM: "#B14F0F",
  FAVOURITES: "#98793C",
  ERROR : "#E53935",
  WARNING: "#FB8C00",
  INFO: "#00ACC1",
  SUCCESS: "#43A047",
  PRIMARY: "#EDAD53", 
  SECONDARY: "#6C757D"
};

export const useThemeColors = () => {
  const scheme = useColorScheme();
  const themeCtx = useContext(themeContext);
  
  // Default to light if themeCtx is not provided or undefined
  const manualTheme = themeCtx?.themePreference || 'light';
  
  if (manualTheme === 'system') {
    return scheme === 'dark' ? darkTheme : lightTheme;
  }
  
  return manualTheme === 'dark' ? darkTheme : lightTheme;
};

// Default export is lightTheme for backwards compatibility
export default lightTheme;