// types.ts
import { PublicKey, Transaction, TransactionInstruction, TransactionInstructionCtorFields } from "@solana/web3.js";

export interface TokenInfo {
  name: string;
  symbol: string;
  mint: PublicKey | string;
  amount: number;
  decimals: number;
  logoURI: string;
  tokenAccount?: string;
  programId: string;
  price?: number;
  balance: number;
  usdValue: number;
  totalValueInUSD?: number;
}

export interface SolAsset {
  name: string;
  symbol: string;
  mint: PublicKey;
  amount: number;
  decimals: number;
  logoURI: string;
  tokenAccount?: string;
  programId: (
    source: PublicKey,
    destination: PublicKey,
    owner: PublicKey,
    amount: number,
    multiSigners: never[],
    programId: any
  ) => Transaction | TransactionInstruction | TransactionInstructionCtorFields;
  price?: number;
  balance: number;
  usdValue: number;
}



/**
 * Converts a TokenInfo object to a SolAsset object
 * @param token TokenInfo object to convert
 * @returns SolAsset object
 */
export function convertToSolAsset(token: TokenInfo): SolAsset {
  // Import this at the top of the file where this function is used
  // import { createTransferInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";
  
  // Create a function that matches the expected signature for programId
  const programIdFunction = (
    source: PublicKey,
    destination: PublicKey,
    owner: PublicKey,
    amount: number,
    multiSigners: never[],
    programId: any
  ): TransactionInstruction => {
    // This should be implemented where the function is used with proper imports
    throw new Error("Function must be implemented where used with proper imports");
  };

  // Convert tokenInfo to SolAsset
  return {
    name: token.name,
    symbol: token.symbol,
    // Ensure mint is a PublicKey
    mint: token.mint instanceof PublicKey ? token.mint : new PublicKey(token.mint.toString()),
    amount: token.amount,
    decimals: token.decimals,
    logoURI: token.logoURI,
    // Ensure tokenAccount is properly handled
    tokenAccount: token.tokenAccount,
    // Use our function for programId
    programId: programIdFunction,
    price: token.price,
    balance: token.balance,
    usdValue: token.totalValueInUSD || token.usdValue || 0
  };
}

/**
 * Converts an array of TokenInfo objects to SolAsset objects
 * @param tokens Array of TokenInfo objects
 * @returns Array of SolAsset objects
 */
export function convertTokensToSolAssets(tokens: TokenInfo[]): SolAsset[] {
  if (!tokens || !Array.isArray(tokens)) {
    return [];
  }
  return tokens.map(convertToSolAsset);
}


// lib/types.ts

/**
 * Interface for Bot Settings.
 */
export interface BotSettings {
  maximumBuyAmount: number; // Max amount to spend per trade (e.g., in SOL)
  minimumBuyAmount: number; // Min amount to spend per trade (e.g., in SOL)
  slippageBps: number; // Slippage tolerance in basis points (e.g., 50 for 0.5%)
  targetWallet?: string; // Add targetWallet to settings interface
  // Add other settings like tokens to ignore, etc.
}

/**
 * Default settings for the bot.
 */
export const DEFAULT_SETTINGS: BotSettings = {
  maximumBuyAmount: 0.5, // Example default
  minimumBuyAmount: 0.01, // Example default
  slippageBps: 50, // 0.5% slippage
  targetWallet: "", // Default empty
};

// Add other shared types here if needed

// Example placeholder for SolAsset if it's not defined elsewhere
// interface SolAsset {
//   name: string;
//   symbol: string;
//   mint: PublicKey;
//   amount: number;
//   decimals: number;
//   logoURI?: string;
//   tokenAccount?: string;
//   programId?: string;
//   balance: number;
//   usdValue: number;
//   price?: number;
//   totalValueInUSD?: number;
// }

// Example placeholder for TokenInfo if it's not defined elsewhere
// interface TokenInfo {
//   mint: PublicKey;
//   amount: number;
//   decimals: number;
//   name: string;
//   symbol: string;
//   logoURI?: string;
//   tokenAccount?: string;
//   programId?: string;
//   balance: number;
//   usdValue: number;
//   price?: number;
//   totalValueInUSD?: number;
// }