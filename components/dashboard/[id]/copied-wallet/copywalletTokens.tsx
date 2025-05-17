"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink } from "lucide-react";
import { toast } from "@/lib/use-toast";
import { getWalletTokensWithPrices, TokenInfo } from "@/lib/token-utils";

interface CopyWalletTokensProps {
  targetWalletAddress: string;
}

/**
 * CopyWalletTokens component displays tokens from the target wallet being copied
 * 
 * @param targetWalletAddress - The wallet address to fetch tokens from
 */
export function CopyWalletTokens({ targetWalletAddress }: CopyWalletTokensProps) {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalValue, setTotalValue] = useState(0);

  // Fetch tokens from the target wallet
  const fetchTargetWalletTokens = async () => {
    if (!targetWalletAddress) {
      setTokens([]);
      setTotalValue(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check for cached token data first
      const tokenCacheKey = `targetWalletTokenCache-${targetWalletAddress}`;
      const cachedTokens = localStorage.getItem(tokenCacheKey);
      
      // Use cached data initially while fetching fresh data
      if (cachedTokens) {
        try {
          const parsedCache = JSON.parse(cachedTokens);
          setTokens(parsedCache);
          
          // Calculate total value from cached tokens
          const totalCachedValue = parsedCache.reduce(
            (sum: number, token: TokenInfo) => sum + (token.totalValueInUSD || 0), 
            0
          );
          setTotalValue(totalCachedValue);
        } catch (e) {
          console.error("Error parsing cached target wallet tokens:", e);
        }
      }

      console.log(`Fetching tokens for target wallet: ${targetWalletAddress}`);
      const result = await getWalletTokensWithPrices(targetWalletAddress, {
        useMainnet: true
      });
      
      console.log(`Found ${result.tokens.length} tokens in target wallet with total value: $${result.totalValue.toFixed(2)}`);
      
      // Enhance token objects with additional information
      const enhancedTokens = result.tokens.map(token => ({
        ...token,
        tokenAccount: token.tokenAccount || token.mint.toString(),
        programId: token.programId || "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
      }));
      
      setTokens(enhancedTokens);
      setTotalValue(result.totalValue);
      
      // Cache the token data
      localStorage.setItem(tokenCacheKey, JSON.stringify(enhancedTokens));
    } catch (err) {
      console.error("Error fetching target wallet token data:", err);
      setError("Failed to load target wallet tokens. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tokens when the target wallet address changes
  useEffect(() => {
    fetchTargetWalletTokens();
    
    // Set up a refresh interval (every minute)
    const refreshInterval = setInterval(() => {
      fetchTargetWalletTokens();
    }, 60000);
    
    return () => clearInterval(refreshInterval);
  }, [targetWalletAddress]);

  // Format USD value
  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  if (!targetWalletAddress) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>No target wallet set</p>
        <p className="text-sm mt-2">Set a wallet address to view its tokens</p>
      </div>
    );
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md font-medium">Target Wallet Tokens</h3>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchTargetWalletTokens}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`https://solscan.io/account/${targetWalletAddress}`, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="text-sm mb-3 flex justify-between">
          <span className="text-muted-foreground truncate max-w-[200px]">
            {targetWalletAddress}
          </span>
          <span className="font-medium">Total: {formatUSD(totalValue)}</span>
        </div>

        {isLoading && tokens.length === 0 ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            <p>{error}</p>
          </div>
        ) : tokens.length > 0 ? (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {tokens.map((token) => (
              <div
                key={token.mint.toString()}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors text-sm"
              >
                <div className="flex items-center space-x-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                    {token.logoURI ? (
                      <img 
                        src={token.logoURI} 
                        alt={token.symbol} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center text-xs font-bold">
                              ${token.symbol.substring(0, 2)}
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <span className="text-xs font-medium">{token.symbol.substring(0, 2)}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{token.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {token.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 4,
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatUSD(token.totalValueInUSD || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>No tokens found in target wallet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}