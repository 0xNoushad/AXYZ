"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

interface AddWalletDialogProps {
  onSubmit: (name: string) => void;
}

export function AddWalletDialog({ onSubmit }: AddWalletDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  const handleSubmit = async () => {
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    try {
      onSubmit(name);
      setName("");
      setOpen(false);
    } catch (error) {
      console.error("Error creating wallet:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button size="sm" className="gap-1 w-full sm:w-auto">
            <PlusCircle className="h-4 w-4" />
            <span>Add Wallet</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Create New Wallet</DrawerTitle>
            <DrawerDescription>
              Generate a new Solana wallet with a custom name.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 py-2">
            <Label htmlFor="wallet-name-mobile" className="text-left block">Wallet Name</Label>
            <Input
              id="wallet-name-mobile"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2"
              placeholder="Enter a name for your wallet"
              autoComplete="off"
            />
          </div>
          <DrawerFooter className="flex flex-col gap-2 pt-2">
            <Button 
              onClick={handleSubmit} 
              disabled={!name.trim() || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Creating..." : "Create Wallet"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1 w-full sm:w-auto">
          <PlusCircle className="h-4 w-4" />
          <span>Add Wallet</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Wallet</DialogTitle>
          <DialogDescription>
            Generate a new Solana wallet with a custom name.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="wallet-name">Wallet Name</Label>
          <Input
            id="wallet-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2"
            placeholder="Enter a name for your wallet"
            autoComplete="off"
          />
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!name.trim() || isSubmitting}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {isSubmitting ? "Creating..." : "Create Wallet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}