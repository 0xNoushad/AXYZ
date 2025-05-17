"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Copy, Pencil, Trash2, MoreHorizontal } from "lucide-react";

// Types
interface KeypairData {
  id: number;
  name: string;
  publicKey: string;
  created: string;
  balance?: number;
}

interface KeypairTableProps {
  keypairs: KeypairData[];
  onCopy: (text: string) => void;
  onEdit: (id: number, newName: string) => void;
  onDelete: (id: number) => void;
  onSelect: (name: string) => void;
}

export function KeypairTable({ 
  keypairs, 
  onCopy, 
  onEdit, 
  onDelete,
  onSelect
}: KeypairTableProps) {
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead>Public Key</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keypairs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                No wallets found. Create your first wallet to get started.
              </TableCell>
            </TableRow>
          ) : (
            keypairs.map((keypair) => (
              <TableRow 
                key={keypair.id}
                className="cursor-pointer hover:bg-accent/50"
                onClick={() => onSelect(keypair.name)}
              >
                <TableCell className="font-medium">{keypair.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{formatPublicKey(keypair.publicKey)}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopy(keypair.publicKey);
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>{keypair.created}</TableCell>
                <TableCell className="text-right">
                  {typeof keypair.balance === 'number' 
                    ? `${keypair.balance.toFixed(4)} SOL` 
                    : '—'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(keypair);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(keypair.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
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