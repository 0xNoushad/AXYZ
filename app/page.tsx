"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSession } from "next-auth/react";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProductPreviewSection } from "@/components/sections/ProductPreviewSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { TermsModal } from "@/components/modals/TermsModal";
import { Loader } from "@/components/ui/loader";
import { AXYZBentoGrid } from "@/components/sections/AXYZBentoGrid";
import { HowItWorksSection } from "@/components/sections/how-it-works";
 
export default function Landing() {
  const [termsOpen, setTermsOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { connected } = useWallet();
  const { status } = useSession();
  const router = useRouter();
  
  // Store wallet connection in localStorage for persistence
  useEffect(() => {
    if (connected) {
      localStorage.setItem('walletConnected', 'true');
    } else {
      localStorage.removeItem('walletConnected');
    }
  }, [connected]);
  
  // Allow time for wallet connection to be established
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000); // Reduced from 1500ms for faster initialization
    
    return () => clearTimeout(timer);
  }, []);
  
  // Enhanced redirection logic with immediate visual feedback
  useEffect(() => {
    if (isInitializing) return;
    
    // Check if wallet is connected or we have a stored connection
    const hasStoredConnection = localStorage.getItem('walletConnected') === 'true';
    
    if ((connected || hasStoredConnection) && status === "authenticated") {
      // Set redirecting state immediately for visual feedback
      setIsRedirecting(true);
      console.log("Wallet connected and authenticated, redirecting to dashboard...");
      router.push("/home");
    }
  }, [connected, status, router, isInitializing]);
  
  // Show loading state while initializing or redirecting
  if (isInitializing || isRedirecting) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }
  
  return (
    <>
      
      <main className="flex flex-col items-center gap-16 px-4 py-12 md:px-6">
        <HeroSection />
        <ProductPreviewSection />
        <div id="axyz-trading">
          <AXYZBentoGrid />
        </div>
        <div className="flex justify-center">
          <HowItWorksSection/>
        </div>
        <FaqSection />
      </main>
      
      <footer className="mx-auto mt-16 flex w-full items-center justify-center gap-[0.5ch] px-4 pb-8 text-center text-muted-foreground">
        <span>You agreed to </span>
        <button 
          onClick={() => setTermsOpen(true)}
          className="inline-flex items-center gap-1 font-semibold text-foreground transition-colors duration-300 ease-out hover:text-primary"
        >
          <span>Terms and Conditions</span>
          <img src="/icons/terms-and-conditions-icon.svg" alt="" className="h-4 w-4" />
        </button>
      </footer>
      
      <TermsModal open={termsOpen} onOpenChange={setTermsOpen} />
    </>
  );
}
