"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, ExternalLink } from "lucide-react";
import { PublicKey } from "@solana/web3.js"; // Assuming PublicKey is needed for validation check display

interface TargetWalletInputProps {
  targetWallet: string;
  onTargetWalletChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isValidAddress: boolean;
  onSave: () => void;
  isSaving?: boolean; // Optional prop for save button loading state
}

/**
 * Component for inputting and saving the target wallet address.
 *
 * @param targetWallet - The current value of the target wallet input.
 * @param onTargetWalletChange - Handler for input change events.
 * @param isValidAddress - Boolean indicating if the entered address is valid.
 * @param onSave - Handler for the save button click.
 * @param isSaving - Optional boolean to show loading state on the save button.
 */
export function TargetWalletInput({
  targetWallet,
  onTargetWalletChange,
  isValidAddress,
  onSave,
  isSaving = false,
}: TargetWalletInputProps) {
  const handleViewOnSolscan = () => {
    if (isValidAddress) {
      window.open(`https://solscan.io/account/${targetWallet}`, "_blank");
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="target-wallet">Target Wallet Address</Label>
      <div className="flex gap-2">
        <Input
          id="target-wallet"
          placeholder="Enter wallet address to copy"
          value={targetWallet}
          onChange={onTargetWalletChange}
          className={!isValidAddress && targetWallet ? "border-red-500" : ""}
        />
        <Button
          variant="outline"
          size="icon"
          onClick={handleViewOnSolscan}
          disabled={!isValidAddress}
          title="View on Solscan"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
        <Button
          onClick={onSave}
          disabled={!isValidAddress || isSaving}
          title="Save Target Wallet"
        >
          {isSaving ? "Saving..." : <Save className="h-4 w-4" />}
        </Button>
      </div>
      {!isValidAddress && targetWallet && (
        <p className="text-sm text-red-500">Invalid Solana address</p>
      )}
    </div>
  );
}