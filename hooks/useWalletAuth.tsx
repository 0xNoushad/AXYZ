import { useWallet } from "@solana/wallet-adapter-react";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { signIn } from "@/lib/auth/signin";

/**
 * Custom hook to manage wallet authentication state
 * 
 * Provides centralized management of wallet connection and authentication state
 * with utilities for checking connection status and handling redirects.
 * 
 * @returns Object containing authentication state and utility functions
 */
export function useWalletAuth() {
  const { connected, publicKey, signMessage } = useWallet();
  const { status } = useSession();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Check if wallet is connected in localStorage
  const hasStoredConnection = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('walletConnected') === 'true';
  }, []);

  // Update connection state in localStorage
  const updateConnectionState = useCallback((isConnected: boolean) => {
    if (typeof window === 'undefined') return;
    
    if (isConnected) {
      localStorage.setItem('walletConnected', 'true');
    } else {
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('hasAttemptedSignIn');
    }
  }, []);

  // Attempt to sign in with connected wallet
  const attemptSignIn = useCallback(async () => {
    if (!publicKey || !signMessage || status === "authenticated" || isAuthenticating) {
      return false;
    }

    // Prevent multiple sign-in attempts for the same wallet
    const hasAttemptedSignIn = localStorage.getItem('hasAttemptedSignIn');
    if (hasAttemptedSignIn === publicKey.toString()) return false;

    try {
      setIsAuthenticating(true);
      localStorage.setItem('hasAttemptedSignIn', publicKey.toString());
      
      const success = await signIn(publicKey, signMessage);
      if (success) {
        updateConnectionState(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error during sign-in attempt:", error);
      localStorage.removeItem('hasAttemptedSignIn');
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [publicKey, signMessage, status, isAuthenticating, updateConnectionState]);

  // Initialize wallet state
  useEffect(() => {
    const initTimer = setTimeout(() => {
      setIsInitializing(false);
      
      // Update connection state if wallet is connected
      if (connected && publicKey) {
        updateConnectionState(true);
      }
    }, 800);
    
    return () => clearTimeout(initTimer);
  }, [connected, publicKey, updateConnectionState]);

  // Handle wallet disconnection
  useEffect(() => {
    if (!connected && !isInitializing) {
      updateConnectionState(false);
    }
  }, [connected, isInitializing, updateConnectionState]);

  return {
    isInitializing,
    isAuthenticating,
    isAuthenticated: status === "authenticated",
    isConnected: connected,
    hasStoredConnection,
    attemptSignIn,
    updateConnectionState,
    walletStatus: {
      connected,
      authenticated: status === "authenticated",
      loading: status === "loading" || isInitializing || isAuthenticating,
    }
  };
}