"use client";
import { SessionProvider } from "next-auth/react";
import ContextProvider from "./ContextProvider";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ContextProvider>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </ContextProvider>
    </SessionProvider>
  );
}