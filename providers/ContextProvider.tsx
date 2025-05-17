"use client";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  Coin98WalletAdapter,
  CoinbaseWalletAdapter,
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  TrustWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { SessionProvider } from "next-auth/react";
import React, { useMemo, useState, useEffect } from "react";

export default function ContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new LedgerWalletAdapter(),
      new TorusWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new Coin98WalletAdapter(),
      new TrustWalletAdapter(),
      // Add more wallets here
    ],
    [],
  );
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_RPC ?? clusterApiUrl("devnet"),
    [],
  );

  // Ensure wallet connection is maintained across page loads
  const [autoConnect, setAutoConnect] = useState(true);
  
  useEffect(() => {
    // Always try to auto-connect for Solana wallets
    localStorage.setItem('autoConnectWallet', 'true');
    setAutoConnect(true);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider 
        wallets={wallets} 
        autoConnect={autoConnect}
        localStorageKey="walletAdapter"
        onError={(error) => {
          console.error('Wallet error:', error);
        }}
      >
        <SessionProvider>
          <div vaul-drawer-wrapper="true">{children}</div>
        </SessionProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
