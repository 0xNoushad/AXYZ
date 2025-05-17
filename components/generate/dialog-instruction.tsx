"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Info } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

/**
 * Dialog component that provides instructions for generating Solana keypairs
 * 
 * @returns JSX.Element
 */
export function GenerateInstructionDialog() {
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");

  const instructionContent = (
    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
      <div className="space-y-2">
        <h3 className="font-medium">Creating a Wallet</h3>
        <p className="text-sm text-muted-foreground">
          Click the "Add Wallet" button to generate a new Solana keypair. You'll need to provide a name for your wallet.
        </p>
      </div>
      <div className="space-y-2">
        <h3 className="font-medium">Security Notice</h3>
        <p className="text-sm text-muted-foreground">
          Your wallet's public key is stored locally in your browser. The private key is not stored for security reasons.
          For real-world usage, consider using a hardware wallet or more secure storage solutions.
        </p>
      </div>
      <div className="space-y-2">
        <h3 className="font-medium">Managing Wallets</h3>
        <p className="text-sm text-muted-foreground">
          You can copy your wallet's public address by clicking the copy icon. Use the "Manage" button for additional options.
        </p>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 w-full sm:w-auto">
            <Info className="h-4 w-4" />
            <span>Instructions</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Solana Wallet Generation</DrawerTitle>
            <DrawerDescription>
              Learn how to create and manage your Solana wallets safely.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-2">
            {instructionContent}
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="w-full">
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 w-full sm:w-auto">
          <Info className="h-4 w-4" />
          <span>Instructions</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solana Wallet Generation</DialogTitle>
          <DialogDescription>
            Learn how to create and manage your Solana wallets safely.
          </DialogDescription>
        </DialogHeader>
        {instructionContent}
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}