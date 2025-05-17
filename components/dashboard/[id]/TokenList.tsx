"use client";

import { useState } from "react";
import Image from "next/image";
import { SolAsset } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TokenListProps {
  tokens: SolAsset[];
}

/**
 * TokenList component displays the user's token holdings with balances and USD values
 * 
 * @param tokens - Array of token assets in the wallet
 */
export function TokenList({ tokens }: TokenListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter tokens based on search query
  const filteredTokens = tokens.filter(token => 
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Display placeholder if no tokens
  if (tokens.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tokens</CardTitle>
          <CardDescription>Your token holdings will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-muted-foreground mb-2">No tokens found</p>
            <p className="text-sm text-muted-foreground">Tokens you receive will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tokens</CardTitle>
        <CardDescription>Your token holdings</CardDescription>
        
        {/* Search input */}
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tokens..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {filteredTokens.length > 0 ? (
            filteredTokens.map((token) => (
              <div 
                key={token.mint.toString()} 
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {token.logoURI ? (
                    <div className="relative h-8 w-8 overflow-hidden rounded-full">
                      <Image 
                        src={token.logoURI} 
                        alt={token.name} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-xs font-medium">
                        {token.symbol.slice(0, 2)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{token.name}</p>
                    <p className="text-xs text-muted-foreground">{token.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {token.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 4
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${token.usdValue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-muted-foreground">No matching tokens found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}