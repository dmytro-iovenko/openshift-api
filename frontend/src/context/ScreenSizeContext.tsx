import React, { createContext, useContext, ReactNode } from "react";
import { useMediaQuery, useTheme } from "@mui/material";

/**
 * Represents the screen size context type.
 */
interface ScreenSizeContextType {
  isMobile: boolean;
}

/**
 * Represents the screen size context.
 */
const ScreenSizeContext = createContext<ScreenSizeContextType | undefined>(undefined);

/**
 * Represents the screen size provider component.
 */
export const ScreenSizeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return <ScreenSizeContext.Provider value={{ isMobile }}>{children}</ScreenSizeContext.Provider>;
};

/**
 * Represents the useScreenSize hook.
 * @returns {ScreenSizeContextType} The screen size context.
 */
export const useScreenSize = (): ScreenSizeContextType => {
  const context = useContext(ScreenSizeContext);
  if (!context) {
    throw new Error("useScreenSize must be used within a ScreenSizeProvider");
  }
  return context;
};
