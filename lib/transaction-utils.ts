"use client";

import { Connection, PublicKey } from '@solana/web3.js';

// Define transaction interface
export interface Transaction {
  signature: string;
  type: "receive" | "send";
  token: string;
  amount: number;
  date: string;
  txId: string;
}

// Define options for transaction fetching
interface TransactionFetchOptions {
  limit?: number;
  useMainnet?: boolean;
  before?: string;
}

/**
 * Get transaction history for a wallet
 * @param walletAddress - The wallet address to check
 * @param options - Options for fetching transactions
 * @returns Array of processed transactions
 */
export async function getTransactionHistory(
  walletAddress: string,
  options: TransactionFetchOptions = {}
): Promise<Transaction[]> {
  try {
    const { limit = 10, useMainnet = true, before } = options;
    
    // Select the appropriate RPC URL based on options
    const rpcUrl = useMainnet 
      ? process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
      : process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL || 'https://api.devnet.solana.com';
    
    // Create connection - use Helius URL if available, otherwise default RPC
    const heliusUrl = process.env.NEXT_PUBLIC_HELIUS_URL;
    const connection = new Connection(heliusUrl || rpcUrl);
    
    // Validate wallet address
    let walletPubkey: PublicKey;
    try {
      walletPubkey = new PublicKey(walletAddress);
    } catch (e) {
      console.error("Invalid wallet address:", e);
      return [];
    }
    
    // Fetch transaction signatures
    const signatures = await connection.getSignaturesForAddress(
      walletPubkey, 
      { limit, before }
    );
    
    if (signatures.length === 0) {
      return [];
    }
    
    // Fetch detailed transaction info
    const transactions = await Promise.all(
      signatures.map(async (sigInfo) => {
        try {
          const txInfo = await connection.getParsedTransaction(
            sigInfo.signature,
            { maxSupportedTransactionVersion: 0 }
          );
          
          if (!txInfo || !txInfo.meta || txInfo.meta.err) {
            return null;
          }
          
          // Process the transaction to determine type, token, amount, etc.
          const { type, token, amount } = processTransaction(txInfo, walletAddress);
          
          // Format date
          const date = sigInfo.blockTime 
            ? new Date(sigInfo.blockTime * 1000).toLocaleString()
            : 'Unknown date';
          
          return {
            signature: sigInfo.signature,
            type,
            token,
            amount,
            date,
            txId: sigInfo.signature
          };
        } catch (error) {
          console.error(`Error fetching transaction ${sigInfo.signature}:`, error);
          return null;
        }
      })
    );
    
    // Filter out null values and return valid transactions
    return transactions.filter((tx): tx is Transaction => tx !== null);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
}

/**
 * Process a transaction to extract relevant information
 * @param txInfo - The parsed transaction info
 * @param walletAddress - The wallet address
 * @returns Object containing transaction type, token, and amount
 */
function processTransaction(txInfo: any, walletAddress: string): { type: "receive" | "send", token: string, amount: number } {
  try {
    let token = "SOL";
    let type: "receive" | "send" = "send";
    let amount = 0;
    
    // Find the account index for this wallet
    const accountIndex = txInfo.transaction.message.accountKeys.findIndex(
      (account: any) => account.pubkey.toString() === walletAddress
    );
    
    if (accountIndex >= 0) {
      // Determine if it's a SOL transfer by checking balance changes
      const preBalance = txInfo.meta.preBalances[accountIndex] / 10**9;
      const postBalance = txInfo.meta.postBalances[accountIndex] / 10**9;
      const balanceChange = postBalance - preBalance;
      
      // Determine if it's a receive or send based on balance change
      if (balanceChange > 0) {
        type = "receive";
        amount = balanceChange;
      } else if (balanceChange < 0) {
        type = "send";
        // For sends, we take the absolute value and subtract the transaction fee
        amount = Math.abs(balanceChange);
        
        // If this wallet paid for the transaction fee, subtract it
        if (txInfo.meta.fee && accountIndex === 0) {
          amount -= (txInfo.meta.fee / 10**9);
        }
      }
      
      // Try to detect token transfers by checking postTokenBalances and preTokenBalances
      if (txInfo.meta.postTokenBalances && txInfo.meta.preTokenBalances) {
        // Find token balance changes for this account
        const preTokens = txInfo.meta.preTokenBalances.filter(
          (bal: any) => bal.accountIndex === accountIndex
        );
        
        const postTokens = txInfo.meta.postTokenBalances.filter(
          (bal: any) => bal.accountIndex === accountIndex
        );
        
        // If we find token balances for this account
        if (preTokens.length > 0 || postTokens.length > 0) {
          // Map by mint to compare pre and post balances
          const preMap = new Map();
          preTokens.forEach((tok: any) => {
            preMap.set(tok.mint, tok.uiTokenAmount.uiAmount || 0);
          });
          
          const postMap = new Map();
          postTokens.forEach((tok: any) => {
            postMap.set(tok.mint, tok.uiTokenAmount.uiAmount || 0);
            
            // If this mint wasn't in pre, it's a new token (likely receive)
            if (!preMap.has(tok.mint) && tok.uiTokenAmount.uiAmount > 0) {
              type = "receive";
              amount = tok.uiTokenAmount.uiAmount;
              token = tok.uiTokenAmount.uiAmountString || tok.symbol || tok.mint.substring(0, 4);
            }
          });
          
          // Check for token transfers (by comparing pre and post balances)
          preMap.forEach((preAmt, mint) => {
            const postAmt = postMap.get(mint) || 0;
            const tokenDiff = postAmt - preAmt;
            
            // If there's a significant change, use this token's info
            if (Math.abs(tokenDiff) > 0.000001) {
              const matchingPost = postTokens.find((t: any) => t.mint === mint);
              const tokenSymbol = matchingPost?.symbol || mint.substring(0, 4);
              
              if (tokenDiff > 0) {
                type = "receive";
                amount = tokenDiff;
                token = tokenSymbol;
              } else if (tokenDiff < 0) {
                type = "send";
                amount = Math.abs(tokenDiff);
                token = tokenSymbol;
              }
            }
          });
        }
      }
      
      // Try to extract token info from program instructions
      if (txInfo.transaction.message.instructions) {
        // Look for token program instructions
        const tokenProgramId = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        const tokenInstructions = txInfo.transaction.message.instructions.filter(
          (ix: any) => ix.programId?.toString() === tokenProgramId
        );
        
        // If there are token instructions, analyze them
        if (tokenInstructions.length > 0 && token === "SOL") {
          // This is a token transaction (and we haven't already identified a specific token)
          // In production, you'd need to decode the token program instruction data
          // to properly identify the specific token and amount
          
          // For now, try to use a generic token symbol if not already identified
          if (txInfo.meta.logMessages) {
            // Try to extract token symbol from logs
            const tokenLogs = txInfo.meta.logMessages.filter(
              (log: string) => log.includes("token") || log.includes("Token")
            );
            
            if (tokenLogs.length > 0) {
              // Simple extraction, in production you'd want more robust parsing
              const tokenMatch = tokenLogs[0].match(/(\w+) token/i);
              if (tokenMatch && tokenMatch[1]) {
                token = tokenMatch[1].toUpperCase();
              } else {
                token = "SPL Token";
              }
            }
          }
        }
      }
    }
    
    // Ensure amount is reasonable (non-negative and not extremely small)
    amount = Math.max(0, parseFloat(amount.toFixed(9)));
    
    return { type, token, amount };
  } catch (error) {
    console.error('Error processing transaction:', error);
    return { type: "send", token: "SOL", amount: 0 };
  }
}