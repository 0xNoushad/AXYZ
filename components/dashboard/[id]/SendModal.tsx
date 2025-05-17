"use client";

import { useState, useEffect } from "react";
import { PublicKey, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TokenInfo, SolAsset } from "@/lib/types";
import { convertTokensToSolAssets } from "@/lib/token-conversion";
import { reconstructKeypair } from "@/lib/keypair-utils";
import { toast } from "@/lib/use-toast";
import { sendSol, sendSplTokens, getOrCreateAssociatedTokenAccount } from "@/lib/tokens";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/ui/credenza";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicKey: PublicKey;
  tokens?: TokenInfo[];  
  walletId: string;
}

/**
 * SendModal component for sending tokens to other wallets
 * 
 * @param isOpen - Whether the modal is open
 * @param onClose - Function to close the modal
 * @param publicKey - The sender's public key
 * @param tokens - Available tokens to send
 * @param walletId - The wallet identifier (needed to retrieve the private key)
 */
export function SendModal({ isOpen, onClose, publicKey, tokens = [], walletId }: SendModalProps) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("SOL");
  const [selectedTokenData, setSelectedTokenData] = useState<SolAsset | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [convertedTokens, setConvertedTokens] = useState<SolAsset[]>([]);
  
  // Connection to the Solana network - using Mainnet
  const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com");
  
  // Convert TokenInfo[] to SolAsset[] once when tokens prop changes
  useEffect(() => {
    if (tokens && tokens.length > 0) {
      const converted = convertTokensToSolAssets(tokens);
      setConvertedTokens(converted);
    } else {
      setConvertedTokens([]);
    }
  }, [tokens]);

  // Set the selected token data when the selectedToken changes
  useEffect(() => {
    if (selectedToken === "SOL") {
      // Create a default SOL asset
      const solAsset: SolAsset = {
        name: "Solana",
        symbol: "SOL",
        mint: new PublicKey("So11111111111111111111111111111111111111112"), // Native SOL mint address
        amount: 0, // Will be fetched separately
        decimals: 9,
        logoURI: "/solana.svg",
        tokenAccount: undefined,
        programId: () => {
          throw new Error("Function not implemented for native SOL");
        },
        price: undefined,
        balance: 0,
        usdValue: 0
      };
      setSelectedTokenData(solAsset);
    } else {
      const token = convertedTokens.find(t => t.symbol === selectedToken);
      setSelectedTokenData(token || null);
    }
  }, [selectedToken, convertedTokens]);
  
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
  
  // Retrieve private key from localStorage
  const getPrivateKey = (): string | null => {
    try {
      const storedKeypairs = localStorage.getItem("solanaKeypairs");
      if (storedKeypairs) {
        const parsedKeypairs = JSON.parse(storedKeypairs);
        const selectedKeypair = parsedKeypairs.find((keypair: any) => keypair.name === walletId);
        if (selectedKeypair && selectedKeypair.privateKey) {
          return selectedKeypair.privateKey;
        }
      }
      return null;
    } catch (error) {
      console.error("Error retrieving private key:", error);
      return null;
    }
  };
  
  // Handle send transaction
  const handleSend = async () => {
    if (!isValidAddress() || !amount || parseFloat(amount) <= 0 || !selectedTokenData) {
      setError("Please enter a valid recipient address and amount");
      return;
    }
    
    setIsSending(true);
    setError(null);
    
    try {
      const privateKey = getPrivateKey();
      if (!privateKey) {
        throw new Error("Private key not found for this wallet");
      }
      
      const keypair = reconstructKeypair(privateKey);
      const recipientPubKey = new PublicKey(recipient);
      const parsedAmount = parseFloat(amount);
      
      // Handle SOL transfers differently from SPL tokens
      if (selectedToken === "SOL") {
        // Converting amount to lamports (SOL's smallest unit)
        const lamports = parsedAmount * LAMPORTS_PER_SOL;
        
        // Use sendSol utility function
        const signature = await sendSol(
          connection,
          keypair,
          recipientPubKey,
          Math.floor(lamports)
        );
        
        toast({
          title: "Transaction Successful",
          description: `Sent ${amount} SOL to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`,
        });
      } else {
        // For SPL tokens
        if (!selectedTokenData || !selectedTokenData.tokenAccount) {
          throw new Error("Token account not found for selected token");
        }
        
        // Calculate token amount based on decimals
        const tokenDecimals = selectedTokenData.decimals || 9;
        const tokenAmount = parsedAmount * Math.pow(10, tokenDecimals);
        
        // Get destination token account or create if needed
        const destinationTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          keypair,
          selectedTokenData.mint,
          recipientPubKey
        );
        
        // Send the tokens
        const signature = await sendSplTokens(
          connection,
          keypair,
          new PublicKey(selectedTokenData.tokenAccount),
          destinationTokenAccount.address,
          keypair.publicKey,
          Math.floor(tokenAmount)
        );
        
        toast({
          title: "Transaction Successful",
          description: `Sent ${amount} ${selectedToken} to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`,
        });
      }
      
      // Close modal and reset form
      onClose();
      setRecipient("");
      setAmount("");
      setSelectedToken("SOL");
    } catch (error: any) {
      console.error("Error sending transaction:", error);
      setError(error.message || "Failed to send transaction. Please try again.");
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <Credenza open={isOpen} onOpenChange={onClose}>
      <CredenzaContent className="flex flex-col justify-between gap-0 rounded-t-3xl border bg-background text-foreground md:max-w-[370px] md:rounded-3xl">
        <CredenzaHeader className="w-full !text-center text-xl font-semibold">
          <CredenzaTitle>Send</CredenzaTitle>
        </CredenzaHeader>
        
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid gap-2">
            <Label htmlFor="recipient">To</Label>
            <Input
              id="recipient"
              placeholder="Enter wallet address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className={recipient && !isValidAddress() ? "border-red-500" : ""}
            />
            {recipient && !isValidAddress() && (
              <p className="text-xs text-red-500">Invalid wallet address</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="token">Token</Label>
              <Select 
                value={selectedToken} 
                onValueChange={setSelectedToken}
              >
                <SelectTrigger id="token">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOL">SOL</SelectItem>
                  {convertedTokens.map((token) => (
                    <SelectItem 
                      key={token.mint.toString()} 
                      value={token.symbol}
                    >
                      {token.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.000001"
              />
            </div>
          </div>
          
          {selectedTokenData && (
            <div className="text-sm text-muted-foreground">
              Available: {selectedTokenData.amount.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 6,
              })} {selectedToken}
            </div>
          )}
          
          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}
        </div>
        
        <div className="flex gap-2 p-4">
          <Button 
            onClick={handleSend} 
            disabled={isSending || !isValidAddress() || !amount || parseFloat(amount) <= 0}
            className="w-full rounded-full font-semibold"
          >
            {isSending ? "Sending..." : "Send"}
          </Button>
        </div>
      </CredenzaContent>
    </Credenza>
  );
}