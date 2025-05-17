"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Copy, Pencil, Trash2, ExternalLink } from "lucide-react";

// Types
interface KeypairData {
  id: number;
  name: string;
  publicKey: string;
  created: string;
  balance?: number;
}

interface KeypairGridProps {
  keypairs: KeypairData[];
  onCopy: (text: string) => void;
  onEdit: (id: number, newName: string) => void;
  onDelete: (id: number) => void;
  onSelect: (name: string) => void;
}

export function KeypairGrid({ 
  keypairs, 
  onCopy, 
  onEdit, 
  onDelete,
  onSelect
}: KeypairGridProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  // Handle edit button click
  const handleEditClick = (keypair: KeypairData) => {
    setEditingId(keypair.id);
    setEditName(keypair.name);
  };
  
  // Handle save edit
  const handleSaveEdit = () => {
    if (editingId !== null && editName.trim()) {
      onEdit(editingId, editName);
      setEditingId(null);
      setEditName("");
    }
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (deleteConfirmId !== null) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };
  
  // Format public key for display
  const formatPublicKey = (key: string) => {
    if (key.length <= 12) return key;
    return `${key.substring(0, 6)}...${key.substring(key.length - 6)}`;
  };
  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {keypairs.length === 0 ? (
          <div className="col-span-full text-center py-6 text-muted-foreground">
            No wallets found. Create your first wallet to get started.
          </div>
        ) : (
          keypairs.map((keypair) => (
            <Card 
              key={keypair.id} 
              className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => onSelect(keypair.name)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-lg truncate">{keypair.name}</h3>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(keypair);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(keypair.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Public Key</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono">{formatPublicKey(keypair.publicKey)}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopy(keypair.publicKey);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{keypair.created}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Balance</span>
                    <span>
                      {typeof keypair.balance === 'number' 
                        ? `${keypair.balance.toFixed(4)} SOL` 
                        : '—'}
                    </span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <div className="text-xs text-muted-foreground">
                  Click to view dashboard
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://solscan.io/account/${keypair.publicKey}`, '_blank');
                  }}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={editingId !== null} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Wallet Name</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Enter new wallet name"
              className="col-span-3"
              autoFocus
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveEdit} disabled={!editName.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this wallet? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}