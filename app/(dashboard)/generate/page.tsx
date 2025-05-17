"use client";
import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Keypair } from "@solana/web3.js";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusCircle, List, Grid } from "lucide-react";

// Components
import { KeypairTable } from "@/components/generate/KeypairTable";
import { KeypairGrid } from "@/components/generate/KeypairGrid";
import { GenerateInstructionDialog } from "@/components/generate/dialog-instruction";
import { AddWalletDialog } from "@/components/generate/AddWalletDialog";

// Types
interface KeypairData {
  id: number;
  name: string;
  publicKey: string;
  created: string;
  balance?: number;
}

// Header component with tabs and add button
function PageHeader({ 
  onAddWallet, 
  viewMode,
  onToggleView
}: { 
  onAddWallet: (name: string) => void;
  viewMode: "grid" | "table";
  onToggleView: () => void;
}) {
  return (
    <div className="space-y-4 pb-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-grow">
          <h1 className="text-xl sm:text-2xl font-semibold">User Wallets</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            An overview of all your Solana wallets and their performance.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <GenerateInstructionDialog />
          <AddWalletDialog onSubmit={onAddWallet} />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onToggleView}
            className="hidden sm:flex items-center gap-1"
          >
            {viewMode === "table" ? (
              <>
                <Grid className="h-4 w-4" />
                <span className="hidden md:inline">Grid View</span>
              </>
            ) : (
              <>
                <List className="h-4 w-4" />
                <span className="hidden md:inline">Table View</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-transparent p-0 h-10 w-full flex justify-start">
            <TabsTrigger 
              value="solana" 
              className="rounded-md data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:rounded-none"
            >
              Solana
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onToggleView}
          className="sm:hidden"
        >
          {viewMode === "table" ? (
            <Grid className="h-4 w-4" />
          ) : (
            <List className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

export default function GeneratePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [keypairs, setKeypairs] = useState<KeypairData[]>([]);
  // Changed default view mode from "grid" to "table"
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  
  // Load keypairs from localStorage on component mount
  useEffect(() => {
    const storedKeypairs = localStorage.getItem("solanaKeypairs");
    if (storedKeypairs) {
      try {
        const parsedKeypairs = JSON.parse(storedKeypairs);
        setKeypairs(parsedKeypairs);
      } catch (error) {
        console.error("Failed to parse stored keypairs:", error);
        toast({
          title: "Error loading keypairs",
          description: "There was a problem loading your saved keypairs.",
          variant: "destructive"
        });
      }
    }
  }, [toast]);
  
  // Save keypairs to localStorage whenever they change
  useEffect(() => {
    if (keypairs.length > 0) {
      // Store without the secretKey for security
      localStorage.setItem("solanaKeypairs", JSON.stringify(keypairs));
    }
  }, [keypairs]);
  
  // Function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    
    toast({
      title: "Copied to clipboard",
      description: "Public key has been copied to your clipboard.",
      duration: 3000, // Auto-dismiss after 3 seconds
    });
  };
  
  // Function to handle editing a keypair
  const handleEditKeypair = (id: number, newName: string) => {
    // Update state with the new name
    setKeypairs(prevKeypairs => {
      const updatedKeypairs = prevKeypairs.map(keypair => 
        keypair.id === id ? { ...keypair, name: newName } : keypair
      );
      
      // Update localStorage to ensure persistence
      localStorage.setItem("solanaKeypairs", JSON.stringify(updatedKeypairs));
      
      return updatedKeypairs;
    });
    
    toast({
      title: "Wallet updated",
      description: `Wallet name has been updated to "${newName}".`,
      duration: 3000, // Auto-dismiss after 3 seconds
    });
  };
  
  // Function to handle deleting a keypair
  const handleDeleteKeypair = (id: number) => {
    // Update state and localStorage in one operation to ensure consistency
    setKeypairs(prevKeypairs => {
      const updatedKeypairs = prevKeypairs.filter(keypair => keypair.id !== id);
      
      // Update localStorage to ensure persistence
      localStorage.setItem("solanaKeypairs", JSON.stringify(updatedKeypairs));
      
      return updatedKeypairs;
    });
    
    toast({
      title: "Wallet deleted",
      description: "The wallet has been permanently deleted.",
      duration: 3000, // Auto-dismiss after 3 seconds
    });
  };
  
  // Function to handle creating a new keypair
  const handleCreateKeypair = (name: string) => {
    try {
      // Generate a new Solana keypair
      const newKeypair = Keypair.generate();
      const publicKey = newKeypair.publicKey.toString();
      
      const newKeypairData: KeypairData = {
        id: Date.now(), // Use timestamp as ID
        name: name,
        publicKey: publicKey,
        created: new Date().toISOString().split("T")[0],
        balance: 0, // Initial balance is 0
      };
      
      // Add the new keypair to state
      setKeypairs(prevKeypairs => [...prevKeypairs, newKeypairData]);
      
      toast({
        title: "Wallet created",
        description: `New wallet "${name}" has been created successfully.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Failed to create keypair:", error);
      toast({
        title: "Error creating wallet",
        description: "There was a problem creating your new wallet.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  // Function to toggle between grid and table view
  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === "grid" ? "table" : "grid");
  }, []);
  
  // Function to handle wallet selection/navigation
  const handleWalletSelect = useCallback((name: string) => {
    router.push(`/dashboard/${encodeURIComponent(name)}`);
  }, [router]);
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <PageHeader 
        onAddWallet={handleCreateKeypair} 
        viewMode={viewMode}
        onToggleView={toggleViewMode}
      />
      
      <div className="rounded-lg border bg-card">
        {viewMode === "table" ? (
          <div className="overflow-x-auto">
            <KeypairTable 
              keypairs={keypairs} 
              onCopy={copyToClipboard}
              onEdit={handleEditKeypair}
              onDelete={handleDeleteKeypair}
              onSelect={handleWalletSelect}
            />
          </div>
        ) : (
          <div className="p-4">
            <KeypairGrid
              keypairs={keypairs}
              onCopy={copyToClipboard}
              onEdit={handleEditKeypair}
              onDelete={handleDeleteKeypair}
              onSelect={handleWalletSelect}
            />
          </div>
        )}
      </div>
      
      <Toaster />
    </div>
  );
}