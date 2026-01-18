import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Theme, themes } from "./themes";

interface ThemeContextType {
  theme: Theme;
  themeName: string;
  setTheme: (name: string) => void;
  availableThemes: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<string>("dark");
  const [theme, setThemeState] = useState<Theme>(themes.dark);

  // Load saved theme on mount
  useEffect(() => {
    AsyncStorage.getItem("selectedTheme").then((saved) => {
      if (saved && themes[saved]) {
        setThemeName(saved);
        setThemeState(themes[saved]);
      }
    });
  }, []);

  const setTheme = (name: string) => {
    if (themes[name]) {
      setThemeName(name);
      setThemeState(themes[name]);
      AsyncStorage.setItem("selectedTheme", name);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeName,
        setTheme,
        availableThemes: Object.keys(themes),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context.theme;
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return context;
}
