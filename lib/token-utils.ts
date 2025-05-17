import getUserTokens from './getUserTokens';
import getTokenPrices from './getTokenPrices';
import { PublicKey } from '@solana/web3.js';

// Define the SolAsset interface that other components expect
export interface SolAsset {
  tokenAccount: string;
  programId: string;
  mint: string;
  name: string;
  symbol: string;
  logoURI: string;
  amount: number;
  decimals: number;
  balance: number;      // Non-optional
  usdValue: number;     // Non-optional
  price: number;        // Non-optional
  priceInUSD: number;   // Non-optional, ensuring all price/value fields are consistent
  totalValueInUSD: number; // Non-optional
}

// TokenInfo interface matching SolAsset exactly to prevent type conflicts
export interface TokenInfo {
  tokenAccount: string;
  programId: string;
  mint: string;
  name: string;
  symbol: string;
  logoURI: string;
  amount: number;
  decimals: number;
  balance: number;      // Non-optional
  usdValue: number;     // Non-optional
  price: number;        // Non-optional
  priceInUSD: number;   // Non-optional
  totalValueInUSD: number; // Non-optional
}

// Cache management
const TOKEN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const PRICE_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

// Cache objects
let tokenCache: Record<string, { tokens: TokenInfo[]; timestamp: number }> = {};
let priceCache: Record<string, { price: number; timestamp: number }> = {};
let heliusApiUsageToday = 0;

/**
 * Fetches tokens for a wallet and their prices
 * 
 * @param walletAddress - The wallet address to fetch tokens for
 * @param options - Optional parameters for the request
 * @returns Promise resolving to tokens and total value
 */
export async function getWalletTokensWithPrices(
  walletAddress: string,
  options: { forceFresh?: boolean; useMainnet?: boolean } = {}
): Promise<{ tokens: TokenInfo[]; totalValue: number }> {
  const { forceFresh = false, useMainnet = true } = options;
  
  // Check cache first unless forceFresh is true
  const cacheKey = `tokens-${walletAddress}`;
  if (!forceFresh && tokenCache[cacheKey] && Date.now() - tokenCache[cacheKey].timestamp < TOKEN_CACHE_TTL) {
    return { 
      tokens: tokenCache[cacheKey].tokens,
      totalValue: tokenCache[cacheKey].tokens.reduce((sum, token) => sum + token.totalValueInUSD, 0)
    };
  }
  
  try {
    // Increment API usage counter
    heliusApiUsageToday++;
    
    // Fetch tokens from the wallet
    const tokens = await getUserTokens(walletAddress);
    
    // Fetch prices for these tokens
    const tokensWithPrices = await getTokenPrices(tokens);
    
    // Transform tokens to ensure all required fields are present and non-optional
    const enhancedTokens: TokenInfo[] = tokensWithPrices.map(token => ({
      ...token,
      // Ensure all required properties exist with default values if not present
      balance: token.amount || 0,
      usdValue: token.totalValueInUSD || 0,
      price: token.priceInUSD || 0,
      priceInUSD: token.priceInUSD || 0,
      totalValueInUSD: token.totalValueInUSD || 0,
      // Ensure tokenAccount exists
      tokenAccount: token.tokenAccount || token.mint,
      // Ensure programId exists as a string
      programId: token.programId || "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
      // Provide defaults for other potentially missing properties
      name: token.name || "Unknown Token",
      symbol: token.symbol || "???", 
      logoURI: token.logoURI || "",
      amount: token.amount || 0,
      decimals: token.decimals || 0
    }));
    
    // Calculate total value
    const totalValue = enhancedTokens.reduce((sum, token) => sum + token.totalValueInUSD, 0);
    
    // Update cache
    tokenCache[cacheKey] = {
      tokens: enhancedTokens,
      timestamp: Date.now()
    };
    
    // Store in localStorage for persistence across page refreshes
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          tokens: enhancedTokens,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error('Error saving token cache to localStorage:', e);
      }
    }
    
    return { tokens: enhancedTokens, totalValue };
  } catch (error) {
    console.error('Error in getWalletTokensWithPrices:', error);
    
    // Try to load from localStorage as fallback
    if (typeof window !== 'undefined') {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          const enhancedTokens: TokenInfo[] = parsed.tokens.map((token: any) => ({
            ...token,
            // Ensure all required properties exist
            balance: token.amount || 0,
            usdValue: token.totalValueInUSD || 0,
            price: token.priceInUSD || 0,
            priceInUSD: token.priceInUSD || 0,
            totalValueInUSD: token.totalValueInUSD || 0,
            // Ensure tokenAccount exists
            tokenAccount: token.tokenAccount || token.mint,
            // Ensure programId exists as a string
            programId: token.programId || "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            // Provide defaults for other potentially missing properties
            name: token.name || "Unknown Token",
            symbol: token.symbol || "???", 
            logoURI: token.logoURI || "",
            amount: token.amount || 0,
            decimals: token.decimals || 0
          }));
          
          return { 
            tokens: enhancedTokens,
            totalValue: enhancedTokens.reduce((sum, token) => sum + token.totalValueInUSD, 0)
          };
        } catch (e) {
          console.error('Error parsing cached token data:', e);
        }
      }
    }
    
    // If everything fails, return an empty array with proper typing
    return { tokens: [], totalValue: 0 };
  }
}

/**
 * Gets the cache status for a wallet's tokens
 * 
 * @param walletAddress - The wallet address to check cache for
 * @returns Cache status information
 */
export function getTokenCacheStatus(walletAddress: string): {
  isCached: boolean;
  age: number | null;
  expiresIn: number | null;
  heliusUsageToday: number;
  pricesCached: number;
} {
  const cacheKey = `tokens-${walletAddress}`;
  const cached = tokenCache[cacheKey];
  
  if (!cached) {
    return {
      isCached: false,
      age: null,
      expiresIn: null,
      heliusUsageToday: heliusApiUsageToday,
      pricesCached: Object.keys(priceCache).length
    };
  }
  
  const now = Date.now();
  const age = now - cached.timestamp;
  const expiresIn = TOKEN_CACHE_TTL - age;
  
  return {
    isCached: true,
    age,
    expiresIn: expiresIn > 0 ? expiresIn : 0,
    heliusUsageToday: heliusApiUsageToday,
    pricesCached: Object.keys(priceCache).length
  };
}

// Reset API usage counter at midnight
if (typeof window !== 'undefined') {
  const resetApiUsage = () => {
    const now = new Date();
    const night = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // tomorrow
      0, 0, 0 // midnight
    );
    const msToMidnight = night.getTime() - now.getTime();
    
    setTimeout(() => {
      heliusApiUsageToday = 0;
      resetApiUsage(); // Set up the next day's reset
    }, msToMidnight);
  };
  
  resetApiUsage();
}