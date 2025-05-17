"use client";
import { Sidebar } from "@/components/navigation/Sidebar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader } from "@/components/ui/loader";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import localFont from 'next/font/local';

// Define the Satoshi variable font with weight range
const satoshi = localFont({
  src: '../../public/fonts/Satoshi-Variable.ttf',
  variable: '--font-satoshi',
});

/**
 * Dashboard Layout Component
 * 
 * Handles authentication and wallet connection state management for the dashboard.
 * Provides redirection logic to ensure users are properly authenticated.
 * Uses the centralized useWalletAuth hook for consistent wallet state management.
 */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const {
    isInitializing,
    isAuthenticated,
    isConnected,
    hasStoredConnection,
    walletStatus,
    attemptSignIn
  } = useWalletAuth();
  
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Attempt to sign in if connected but not authenticated
  useEffect(() => {
    if (isConnected && !isAuthenticated && !isInitializing) {
      attemptSignIn();
    }
  }, [isConnected, isAuthenticated, isInitializing, attemptSignIn]);

  // Handle redirection logic after initialization
  useEffect(() => {
    // Only proceed if initialization is complete
    if (isInitializing) return;
    
    // Only redirect if definitely not connected and not authenticated
    if (!isAuthenticated && !isConnected && !hasStoredConnection()) {
      // Set redirecting state immediately for visual feedback
      setIsRedirecting(true);
      console.log("Not authenticated and no wallet connection, redirecting to landing page...");
      
      // Use a short timeout to allow any pending state updates to complete
      setTimeout(() => {
        router.push("/");
      }, 100);
    }
  }, [isAuthenticated, isConnected, router, isInitializing, hasStoredConnection]);

  // Show appropriate loading state with descriptive message
  if (isInitializing || walletStatus.loading || isRedirecting) {
    return (
      <div className={`flex h-screen flex-col items-center justify-center gap-4 ${satoshi.variable}`}>
        <Loader size="lg" />
        <p className="text-sm text-muted-foreground">
          {isInitializing ? "Initializing wallet connection..." :
           isRedirecting ? "Redirecting to login..." :
           "Loading your dashboard..."}
        </p>
      </div>
    );
  }

  // Render dashboard even if just connected but not yet authenticated
  return (
    <div className={`flex h-screen w-full ${satoshi.variable}`}>
      <Sidebar />
      <main className="flex-1 overflow-auto text-gray-200 dashboard-container">
        {children}
      </main>
    </div>
  );


}