// token-conversion.ts
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { createTransferInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { TokenInfo, SolAsset } from "./types";

/**
 * Converts a TokenInfo object to a SolAsset object with proper function implementation
 * @param token TokenInfo object to convert
 * @returns SolAsset object
 */
export function convertToSolAsset(token: TokenInfo): SolAsset {
  // Create a function that matches the expected signature
  const programIdFunction = (
    source: PublicKey,
    destination: PublicKey,
    owner: PublicKey,
    amount: number,
    multiSigners: never[],
    programId: any
  ): TransactionInstruction => {
    // Use the createTransferInstruction from spl-token
    return createTransferInstruction(
      source,
      destination,
      owner,
      amount,
      multiSigners,
      // Use the programId from the token or default to TOKEN_PROGRAM_ID
      programId || (token.programId ? new PublicKey(token.programId) : TOKEN_PROGRAM_ID)
    );
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