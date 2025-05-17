import ContextProvider from "@/providers/ContextProvider";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Import Inter as the main font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Keep Satoshi as a secondary font
const satoshi = localFont({
  src: [
    { path: "./fonts/Satoshi-Black.ttf", weight: "800" },
    { path: "./fonts/Satoshi-Bold.ttf", weight: "700" },
    { path: "./fonts/Satoshi-Medium.ttf", weight: "500" },
    { path: "./fonts/Satoshi-Regular.ttf", weight: "400" },
  ],
  variable: "--font-satoshi",
});

export const metadata: Metadata = {
  title: "AXYZ - Automate Solana Wallet Behavior",
  description:
    "Automate Solana wallet behavior by mirroring transactions in real time. Track, follow, and copy strategies from high-performing traders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${satoshi.variable} font-sans antialiased`}>
        <div vaul-drawer-wrapper="true" className="relative bg-background">
          <ContextProvider>
            <ThemeProvider
              disableTransitionOnChange
              attribute="class"
              defaultTheme="dark"
            >
              <div className="fixed inset-0 z-0 bg-background">
                <div className="h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:25px_25px] opacity-30 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
              </div>
              <div className="relative z-10">
                <div className="container mx-auto px-2 py-4">
                  <div className="flex items-center mb-4">
                   </div>
                  {children}
                </div>
              </div>
            </ThemeProvider>
          </ContextProvider>
        </div>
        <Script src="https://scripts.simpleanalyticscdn.com/latest.js" />
      </body>
    </html>
  );
}
