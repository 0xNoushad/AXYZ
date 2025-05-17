"use client";

import { PublicKey } from "@solana/web3.js";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Copy, Send, Download, Settings } from "lucide-react";
import { SolAsset } from "@/lib/types";

interface WalletActionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  publicKey: PublicKey;
  tokens?: SolAsset[];
  onCopyWallet: () => void;
  // onSettings: () => void; // Settings functionality removed
  onSend?: () => void;
  onReceive?: () => void;
}

/**
 * WalletActionsDrawer component for mobile devices that combines send, receive, and other wallet actions
 * 
 * @param isOpen - Whether the drawer is open
 * @param onClose - Function to close the drawer
 * @param publicKey - The wallet's public key
 * @param tokens - Available tokens to send
 * @param onCopyWallet - Function to handle copy wallet action
 * @param onSettings - Function to handle settings action
 */
export function WalletActionsDrawer({ 
  isOpen, 
  onClose, 
  publicKey, 
  tokens = [],
  onCopyWallet,
  // onSettings, // Settings functionality removed
  onSend,
  onReceive
}: WalletActionsDrawerProps) {
  const [activeTab, setActiveTab] = useState("receive");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("SOL");
  const [requestAmount, setRequestAmount] = useState("");
  
  const walletAddress = publicKey.toString();
  
  // Generate QR code value with optional amount
  const getQrValue = () => {
    const baseValue = `solana:${walletAddress}`;
    return requestAmount ? `${baseValue}?amount=${requestAmount}` : baseValue;
  };
  
  // Validate recipient address
  const isValidAddress = () => {
    try {
      if (recipient) {
        new PublicKey(recipient);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };
  
  // Handle send transaction
  const handleSend = async () => {
    if (!isValidAddress() || !amount || parseFloat(amount) <= 0) {
      return;
    }
    
    try {
      // If parent provided onSend handler, use it
      if (onSend) {
        onSend();
      } else {
        // Otherwise use internal implementation
        // In a real app, this would send a transaction to the blockchain
        // For demo purposes, we'll just close the drawer
        setRecipient("");
        setAmount("");
        setSelectedToken("SOL");
      }
      onClose();
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };
  
  // Handle copy address to clipboard
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    // Could add a toast notification here
  };
  
  // Handle action button clicks
  const handleAction = (actionFn?: () => void) => {
    if (actionFn) {
      actionFn();
    }
    onClose();
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[50vh] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle>Wallet Actions</SheetTitle>
        </SheetHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex flex-col space-y-4">
            <Button 
              variant="outline" 
              className="flex items-center justify-start h-12"
              onClick={() => handleAction(onSend)}
            >
              <Send className="mr-3 h-5 w-5" />
              <span>Send</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center justify-start h-12"
              onClick={() => handleAction(onReceive)}
            >
              <Download className="mr-3 h-5 w-5" />
              <span>Receive</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center justify-start h-12"
              onClick={() => handleAction(onCopyWallet)}
            >
              <Copy className="mr-3 h-5 w-5" />
              <span>Copy Wallet</span>
            </Button>
            
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}