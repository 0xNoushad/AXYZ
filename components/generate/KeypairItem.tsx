"use client";

import { Key, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

/**
 * Component for displaying a single keypair with actions
 * 
 * @param keypair - Keypair data object
 * @param onCopy - Callback function when copy button is clicked
 * @returns JSX.Element
 */
export function KeypairItem({ 
  keypair, 
  onCopy,
  onEdit,
  onDelete
}: { 
  keypair: { 
    id: number; 
    name: string; 
    publicKey: string; 
    created: string;
    status?: "active" | "inactive";
  };
  onCopy: (text: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  // Format public key for display (first 6 and last 4 characters)
  const formatPublicKey = (key: string) => {
    if (key.length <= 10) return key;
    return `${key.substring(0, 6)}...${key.substring(key.length - 4)}`;
  };

  return (
    <div className="relative rounded-lg border p-3 sm:p-5 transition-all hover:shadow-md bg-card hover:border-blue-200 group">
      {/* Status Badge */}
      <div className="absolute top-2 right-2">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
          ${keypair.status === "inactive" 
            ? "bg-yellow-100 text-yellow-800" 
            : "bg-green-100 text-green-800"}`}>
          {keypair.status || "Active"}
        </span>
      </div>

      {/* Keypair Header */}
      <div className="flex items-start justify-between mb-3 mt-4 sm:mt-0">
        <div>
          <h3 className="text-base font-semibold text-foreground group-hover:text-blue-600 transition-colors truncate max-w-[180px]">
            {keypair.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            Created: {keypair.created}
          </p>
        </div>
        <Key className="h-5 w-5 text-muted-foreground ml-2" />
      </div>
      
      {/* Public Key Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 overflow-hidden">
            <code className="text-xs sm:text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded truncate max-w-[120px] sm:max-w-full">
              {formatPublicKey(keypair.publicKey)}
            </code>
            <button 
              onClick={() => onCopy(keypair.publicKey)}
              className="text-muted-foreground hover:text-blue-600 transition-colors flex-shrink-0"
              aria-label="Copy public key"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <a 
              href={`https://solscan.io/account/${keypair.publicKey}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-blue-600 transition-colors flex-shrink-0"
              aria-label="View on Solscan"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" x2="21" y1="14" y2="3" />
              </svg>
            </a>
          </div>

          {/* Dropdown Menu for Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-muted/50"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[150px]">
              {onEdit && (
                <DropdownMenuItem onSelect={onEdit}>
                  Edit Wallet
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onSelect={onDelete} 
                  className="text-destructive focus:text-destructive"
                >
                  Delete Wallet
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Dashboard Link */}
      <Link href={`/dashboard/${keypair.id}`} className="block">
        <Button 
          variant="outline" 
          className="w-full text-xs sm:text-sm hover:bg-blue-50 hover:text-blue-600 transition-all"
        >
          View Dashboard
        </Button>
      </Link>
    </div>
  );
}
