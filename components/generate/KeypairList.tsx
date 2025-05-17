"use client";

import { Key } from "lucide-react";
import { KeypairItem } from "./KeypairItem";

/**
 * Component for displaying a grid of keypairs
 * 
 * @param keypairs - Array of keypair data objects
 * @param onCopy - Callback function when copy button is clicked
 * @returns JSX.Element
 */
export function KeypairList({ 
  keypairs, 
  onCopy,
  onEdit,
  onDelete
}: { 
  keypairs: Array<{ 
    id: number; 
    name: string; 
    publicKey: string; 
    created: string;
    status?: "active" | "inactive";
  }>;
  onCopy: (text: string) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-semibold">Your Wallets</h2>
        <p className="text-sm text-muted-foreground hidden sm:block">
          {keypairs.length} wallet{keypairs.length !== 1 ? 's' : ''} total
        </p>
      </div>
      
      {keypairs.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed p-8 text-center">
          <Key className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">No wallets yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first Solana wallet using the button above
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {keypairs.map((keypair) => (
            <KeypairItem 
              key={keypair.id} 
              keypair={keypair} 
              onCopy={onCopy}
              onEdit={onEdit ? () => onEdit(keypair.id) : undefined}
              onDelete={onDelete ? () => onDelete(keypair.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}