"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Form component for creating a new Solana keypair
 * 
 * @param onSubmit - Callback function when form is submitted with keypair name
 * @param onCancel - Callback function when form is cancelled
 * @returns JSX.Element
 */
export function KeypairForm({ 
  onSubmit, 
  onCancel 
}: { 
  onSubmit: (name: string) => void;
  onCancel: () => void;
}) {
  const [keypairName, setKeypairName] = useState("");
  
  const handleSubmit = () => {
    if (keypairName.trim()) {
      onSubmit(keypairName);
      setKeypairName("");
    }
  };
  
  return (
    <div className="rounded-lg border p-6 bg-card">
      <h2 className="text-xl font-medium">Create New Keypair</h2>
      <div className="mt-4 space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="keypair-name">Keypair Name</Label>
          <Input 
            id="keypair-name" 
            value={keypairName}
            onChange={(e) => setKeypairName(e.target.value)}
            placeholder="Enter a name for this keypair" 
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleSubmit}
            disabled={!keypairName.trim()}
          >
            Create Keypair
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}