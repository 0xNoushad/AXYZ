"use client";

import { PublicKey } from "@solana/web3.js";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/ui/credenza";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { WalletAddress } from "@/components/ui/wallet-address";

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicKey: PublicKey;
}

/**
 * ReceiveModal component for displaying wallet address and QR code
 * 
 * @param isOpen - Whether the modal is open
 * @param onClose - Function to close the modal
 * @param publicKey - The wallet's public key
 */
export function ReceiveModal({ isOpen, onClose, publicKey }: ReceiveModalProps) {
  const walletAddress = publicKey.toString();
  
  // Generate QR code value
  const getQrValue = () => {
    return `solana:${walletAddress}`;
  };
  
  // Handle copy address to clipboard
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    // Could add a toast notification here
  };
  
  return (
    <Credenza open={isOpen} onOpenChange={onClose}>
      <CredenzaContent className="flex flex-col justify-between gap-0 rounded-t-3xl border bg-background text-foreground md:max-w-[370px] md:rounded-3xl">
        <CredenzaHeader className="w-full !text-center text-xl font-semibold">
          <CredenzaTitle>Receive</CredenzaTitle>
        </CredenzaHeader>
        
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
          {/* QR Code */}
          <div className="flex h-48 w-48 items-center justify-center rounded-lg border bg-white p-2">
            <QRCodeSVG 
              value={getQrValue()} 
              size={160}
              bgColor={"#FFFFFF"}
              fgColor={"#000000"}
              level={"L"}
              includeMargin={false}
            />
          </div>
          
          {/* Wallet Address */}
          <div className="w-full">
            <div className="flex items-center justify-center">
              <WalletAddress publicKey={publicKey} size="lg" showCopyButton={true} />
            </div>
          </div>
        </div>
        
      
      </CredenzaContent>
    </Credenza>
  );
}