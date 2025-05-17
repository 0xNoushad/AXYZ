"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditWalletDialog } from "@/components/generate/EditWalletDialog";

interface WalletActionsProps {
  walletId: string;
  walletName?: string;
  walletAddress: string;
  onDelete: (id: string) => void;
  onEdit: (id: string, data: any) => void;
}

export function WalletActions({
  walletId,
  walletName,
  walletAddress,
  onDelete,
  onEdit,
}: WalletActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this wallet?")) {
      onDelete(walletId);
    }
  };

  const handleEditComplete = (data: any) => {
    onEdit(walletId, data);
    setShowEditDialog(false);
  };

  return (
    <div className="flex space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleEdit}
        className="h-8 w-8 text-muted-foreground hover:text-primary"
      >
        <Pencil className="h-4 w-4" />
        <span className="sr-only">Edit wallet</span>
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete wallet</span>
      </Button>

      {showEditDialog && (
        <EditWalletDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          defaultValues={{
            name: walletName || "",
            address: walletAddress,
          }}
          onSubmit={handleEditComplete}
        />
      )}
    </div>
  );
}