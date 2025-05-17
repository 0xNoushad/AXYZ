import { WalletConnectModal } from "@/components/modals/WalletConnectModal";
import { useBalance } from "@/hooks/useBalance";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { WalletName } from "@solana/wallet-adapter-base";
import { useConnection, useWallet, Wallet } from "@solana/wallet-adapter-react";
import { useAnimation } from "framer-motion";
import { signOut } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { ConnectedWalletModal } from "./modals/ConnectedWalletModal";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/loader";

export const ConnectionModal = () => {
  const controls = useAnimation();
  const { publicKey, wallet, wallets, connected, signMessage } = useWallet();
  const [openConnectModal, setOpenConnectModal] = useState(false);
  const [openWalletModal, setOpenWalletModal] = useState(false);
  const { connection } = useConnection();
  const balance = useBalance(publicKey, connection);
  const { connectWallet, disconnectWallet, isConnecting } = useWalletConnection();
  const router = useRouter();
  
  // Add event listener for the hidden trigger button
  useEffect(() => {
    const triggerButton = document.querySelector('.wallet-connect-trigger');
    if (triggerButton) {
      triggerButton.addEventListener('click', () => setOpenConnectModal(true));
    }
    return () => {
      if (triggerButton) {
        triggerButton.removeEventListener('click', () => setOpenConnectModal(true));
      }
    };
  }, []);
  
  // Use our centralized wallet auth hook
  const {
    isAuthenticated,
    isAuthenticating,
    attemptSignIn,
    updateConnectionState,
    walletStatus
  } = useWalletAuth();

  const installedWallets = useMemo(
    () => wallets?.filter((wallet) => wallet.readyState === "Installed"),
    [wallets],
  );

  const uninstalledWallets = useMemo(
    () => wallets?.filter((wallet) => wallet.readyState !== "Installed"),
    [wallets],
  );

  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Update connection status when authenticated
  useEffect(() => {
    if (connected && isAuthenticated) {
      updateConnectionState(true);
      console.log("Wallet connection confirmed and authenticated");
    }
  }, [connected, isAuthenticated, updateConnectionState]);

  // Improved connection handler with transition state
  const handleConnect = async (walletName: WalletName) => {
    setIsTransitioning(true);
    const success = await connectWallet(walletName);
    
    if (success && connected && publicKey && signMessage) {
      setOpenConnectModal(false);
      updateConnectionState(true);
      
      try {
        console.log("Attempting automatic sign-in after connection...");
        const signInSuccess = await attemptSignIn();
        
        if (signInSuccess) {
          console.log("Sign-in successful, redirecting to home...");
          router.push("/home");
        } else {
          console.error("Sign-in failed after connection");
          setIsTransitioning(false);
        }
      } catch (error) {
        console.error("Error during auto sign-in:", error);
        setIsTransitioning(false);
      }
    } else {
      setIsTransitioning(false);
    }
  };
  
  // REMOVE THIS DUPLICATE EFFECT - This is causing the double sign-in
  // useEffect(() => {
  //   const attemptAutoSignIn = async () => {
  //     if (connected && publicKey && signMessage && status !== "authenticated") {
  //       console.log("Wallet connected but not authenticated - triggering sign-in");
  //       try {
  //         const success = await signIn(publicKey, signMessage);
  //         if (success) {
  //           localStorage.setItem('walletConnected', 'true');
  //           console.log("Auto sign-in successful, redirecting to home...");
  //           router.push("/home");
  //         }
  //       } catch (error) {
  //         console.error("Auto sign-in failed:", error);
  //       }
  //     }
  //   };

  //   // Small delay to ensure wallet is fully connected
  //   const timer = setTimeout(() => {
  //     attemptAutoSignIn();
  //   }, 500);
    
  //   return () => clearTimeout(timer);
  // }, [connected, publicKey, signMessage, status, router]);
  
  // Update the handleDisconnect function
  const handleDisconnect = async () => {
    setIsTransitioning(true);
    const success = await disconnectWallet();
    
    if (success) {
      // Clear connection state and session
      updateConnectionState(false);
      await signOut({ redirect: false });
      setOpenWalletModal(false);
      
      // Navigate to landing page
      console.log("Wallet disconnected, redirecting to landing page...");
      router.push("/");
    } else {
      setIsTransitioning(false);
    }
  };

  // Effect to handle authentication status changes
  useEffect(() => {
    if (!isAuthenticated || isAuthenticating) {
      console.group("🔐 Authentication Status");
      console.log(
        "%cUnauthenticated: %cSignature pending",
        "font-weight: bold; color: #ff6b6b;",
        "color: #868e96;",
      );
      console.groupEnd();
    } else if (isAuthenticated) {
      console.group("🔐 Authentication Status");
      console.log(
        "%cAuthenticated: %cSignature confirmed",
        "font-weight: bold; color: #51cf66;",
        "color: #868e96;",
      );
      console.groupEnd();
      
      // Only redirect if explicitly on the landing page and connected
      if (window.location.pathname === "/" && connected) {
        console.log("Authentication confirmed, redirecting to home...");
        router.push("/home");
      }
    }
  }, [isAuthenticated, isAuthenticating, router, connected]);

  // Only trigger sign-in when wallet is connected but not authenticated
  // This is the ONLY useEffect that should handle auto sign-in
  useEffect(() => {
    // Don't trigger sign-in if already authenticated or no wallet is connected
    if (!connected || !publicKey || isAuthenticated || isAuthenticating) return;
    
    const handleSigninMessage = async () => {
      try {
        const success = await attemptSignIn();
        if (success) {
          console.log("Auto sign-in successful");
          
          // Redirect to home if on landing page
          if (window.location.pathname === "/") {
            router.push("/home");
          }
        }
      } catch (error) {
        console.error("Error during sign-in message:", error);
      }
    };

    // Small delay to ensure wallet is fully connected
    const timer = setTimeout(() => {
      handleSigninMessage();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [connected, publicKey, isAuthenticated, isAuthenticating, attemptSignIn, router]);

  // Update connection state when wallet is disconnected
  useEffect(() => {
    if (!connected) {
      updateConnectionState(false);
    }
  }, [connected, updateConnectionState]);

  // REMOVE THIS DUPLICATE EFFECT - This is causing the double sign-in
  // useEffect(() => {
  //   if (connected && publicKey && signMessage && status !== "authenticated") {
  //     console.log("Wallet connected but not authenticated - triggering sign-in");
  //     (async () => {
  //       try {
  //         const success = await signIn(publicKey, signMessage);
  //         if (success) {
  //           localStorage.setItem('walletConnected', 'true');
  //           console.log("Auto sign-in successful");
  //         }
  //       } catch (error) {
  //         console.error("Auto sign-in failed:", error);
  //       }
  //     })();
  //   }
  // }, [connected, publicKey, signMessage, status]);

  // Add this effect to protect routes
  useEffect(() => {
    // Check if we're on a protected route
    const isProtectedRoute = window.location.pathname.startsWith('/home');
    
    // If on protected route but not authenticated, redirect to landing
    if (isProtectedRoute && status === "unauthenticated") {
      console.log("Unauthenticated access to protected route, redirecting to landing...");
      window.location.href = "/";
    }
  }, [status]);

  if (connected && publicKey && signMessage) {
    return (
      <ConnectedWalletModal
        wallet={wallet as Wallet}
        publicKey={publicKey}
        balance={balance}
        onDisconnect={handleDisconnect}
        open={openWalletModal}
        onOpenChange={setOpenWalletModal}
        isConnecting={isConnecting}
        signMessage={signMessage}
        setOpenWalletModal={setOpenWalletModal}
        status={status}
      />
    );
  }

  return (
    <WalletConnectModal
      controls={controls}
      installedWallets={installedWallets}
      uninstalledWallets={uninstalledWallets}
      onConnect={handleConnect}
      open={openConnectModal}
      onOpenChange={setOpenConnectModal}
      isConnecting={isConnecting}
    />
  );
  
  // Show loader during transitions
  if (isTransitioning) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader size="md" />
      </div>
    );
  }
};
