"use client";

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  Keypair,
} from '@solana/web3.js';

import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

/**
 * Interface for token account
 */
export interface TokenAccount {
  address: PublicKey;
  isAssociated: boolean;
  owner: PublicKey;
}

/**
 * Get or create an associated token account for a given wallet and token mint
 * @param connection - Solana connection
 * @param payer - Keypair to pay for the transaction
 * @param mint - Token mint address
 * @param owner - Owner wallet address
 * @returns Token account information
 */
export async function getOrCreateAssociatedTokenAccount(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey,
  owner: PublicKey
): Promise<TokenAccount> {
  // Get the associated token account address
  const associatedTokenAddress = await getAssociatedTokenAddress(
    mint,
    owner,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  
  // Check if the account already exists
  try {
    const account = await getAccount(
      connection,
      associatedTokenAddress,
      'confirmed',
      TOKEN_PROGRAM_ID
    );
    
    // Account exists, return it
    return {
      address: associatedTokenAddress,
      isAssociated: true,
      owner: account.owner,
    };
  } catch (error: any) {
    // If account does not exist, create it
    if (error.name === 'TokenAccountNotFoundError') {
      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          associatedTokenAddress,
          owner,
          mint,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = payer.publicKey;
      
      // Sign and send the transaction
      await sendAndConfirmTransaction(connection, transaction, [payer]);
      
      // Return the new account
      return {
        address: associatedTokenAddress,
        isAssociated: true,
        owner,
      };
    }
    
    throw error;
  }
}

/**
 * Send SPL tokens from one wallet to another
 * @param connection - Solana connection
 * @param payer - Keypair of the sender
 * @param source - Source token account
 * @param destination - Destination token account
 * @param owner - Owner of the source token account
 * @param amount - Amount to send (in token's smallest units)
 * @returns Transaction signature
 */
export async function sendSplTokens(
  connection: Connection,
  payer: Keypair,
  source: PublicKey,
  destination: PublicKey,
  owner: PublicKey,
  amount: number
): Promise<string> {
  // Create transaction
  const transaction = new Transaction().add(
    createTransferInstruction(
      source,
      destination,
      owner,
      amount,
      [],
      TOKEN_PROGRAM_ID
    )
  );
  
  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = payer.publicKey;
  
  // Sign and send the transaction
  const signature = await sendAndConfirmTransaction(connection, transaction, [payer]);
  return signature;
}

/**
 * Send SOL from one wallet to another
 * @param connection - Solana connection
 * @param payer - Keypair of the sender
 * @param destination - Destination wallet address
 * @param amount - Amount to send in lamports
 * @returns Transaction signature
 */
export async function sendSol(
  connection: Connection,
  payer: Keypair,
  destination: PublicKey,
  amount: number
): Promise<string> {
  // Create transaction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: destination,
      lamports: amount,
    })
  );
  
  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = payer.publicKey;
  
  // Sign and send the transaction
  const signature = await sendAndConfirmTransaction(connection, transaction, [payer]);
  return signature;
}