"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Header component for the Generate page with title and action button
 * 
 * @param onNewKeypair - Callback function when New Keypair button is clicked
 * @returns JSX.Element
 */
export function PageHeader({ onNewKeypair }: { onNewKeypair: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Generate</h1>
        <p className="mt-2 text-muted-foreground">
          Create and manage your Solana keypairs
        </p>
      </div>
      <Button 
        onClick={onNewKeypair}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
      >
        <Plus className="mr-2 h-4 w-4" /> New Keypair
      </Button>
    </div>
  );
}