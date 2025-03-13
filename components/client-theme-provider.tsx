"use client";

import { ThemeProvider } from "./theme-provider";
import { usePathname as nextUsePathname } from "next/navigation";

export function ClientThemeProvider({ children }: { children: React.ReactNode }) {
  
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {/* You can use pathname here for any client-side logic */}
      {children}
    </ThemeProvider>
  );
}

export function getPathname() {
  return nextUsePathname();
}