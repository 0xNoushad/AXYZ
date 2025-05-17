"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

interface EditWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues: {
    name: string;
    address: string;
  };
  onSubmit: (data: { name: string }) => void;
  onDelete?: () => void;
}

export function EditWalletDialog({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  onDelete,
}: EditWalletDialogProps) {
  const [name, setName] = useState(defaultValues.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Wallet</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="name" className="sm:text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="sm:col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="address" className="sm:text-right">
                Address
              </Label>
              <div className="sm:col-span-3 overflow-hidden">
                <Input
                  id="address"
                  value={defaultValues.address}
                  disabled
                  className="text-muted-foreground text-xs sm:text-sm font-mono truncate"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between">
            {onDelete && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={onDelete}
                className="w-full sm:w-auto sm:mr-auto order-2 sm:order-1"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            )}
            <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-auto"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="flex-1 sm:flex-auto"
              >
                Save changes
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}