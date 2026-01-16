import React, { createContext, useContext } from "react";
import { HighwayDark, Theme } from "./themes";

const ThemeContext = createContext<Theme>(HighwayDark);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={HighwayDark}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
