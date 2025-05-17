// tokens.ts - Enhanced token utilities

import {
    Connection,
    PublicKey,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction,
    Keypair,
    Commitment,
    SendOptions,
    TransactionInstruction,
    TransactionMessage,
    VersionedTransaction,
  } from '@solana/web3.js';
  
  import {
    createTransferInstruction,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    getAccount,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    AccountLayout,
    Account,
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
   * @param commitment - Commitment level (default: 'confirmed')
   * @returns Promise resolving to TokenAccount
   */
  export async function getOrCreateAssociatedTokenAccount(
    connection: Connection,
    payer: Keypair,
    mint: PublicKey,
    owner: PublicKey,
    commitment: Commitment = 'confirmed'
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
        commitment,
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
        
        try {
          // Get recent blockhash
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash(commitment);
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = payer.publicKey;
          transaction.lastValidBlockHeight = lastValidBlockHeight;
          
          // Sign and send the transaction
          await sendAndConfirmTransaction(
            connection, 
            transaction, 
            [payer],
            { commitment }
          );
          
          // Return the new account
          return {
            address: associatedTokenAddress,
            isAssociated: true,
            owner,
          };
        } catch (createError) {
          // If there was a race condition and the account was already created
          try {
            const account = await getAccount(
              connection,
              associatedTokenAddress,
              commitment,
              TOKEN_PROGRAM_ID
            );
            
            return {
              address: associatedTokenAddress,
              isAssociated: true,
              owner: account.owner,
            };
          } catch (finalError) {
            throw createError;
          }
        }
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
   * @param options - Optional transaction parameters
   * @returns Promise resolving to transaction signature
   */
  export async function sendSplTokens(
    connection: Connection,
    payer: Keypair,
    source: PublicKey,
    destination: PublicKey,
    owner: PublicKey,
    amount: number,
    options?: SendOptions & { commitment?: Commitment }
  ): Promise<string> {
    try {
      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        source,
        destination,
        owner,
        amount,
        [],
        TOKEN_PROGRAM_ID
      );
      
      // Use legacy or versioned transactions based on RPC support
      const useVersionedTransactions = await supportsVersionedTransactions(connection);
      
      if (useVersionedTransactions) {
        return await sendVersionedTransaction(
          connection,
          payer,
          [transferInstruction],
          options?.commitment || 'confirmed'
        );
      } else {
        // Create legacy transaction
        const transaction = new Transaction().add(transferInstruction);
        
        // Get recent blockhash
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash(
          options?.commitment || 'confirmed'
        );
        transaction.recentBlockhash = blockhash;
        transaction.lastValidBlockHeight = lastValidBlockHeight;
        transaction.feePayer = payer.publicKey;
        
        // Sign and send the transaction
        const signature = await sendAndConfirmTransaction(
          connection, 
          transaction, 
          [payer],
          options
        );
        return signature;
      }
    } catch (error) {
      console.error('Error in sendSplTokens:', error);
      throw error;
    }
  }
  
  /**
   * Send SOL from one wallet to another
   * @param connection - Solana connection
   * @param payer - Keypair of the sender
   * @param destination - Destination wallet address
   * @param amount - Amount to send in lamports
   * @param options - Optional transaction parameters
   * @returns Promise resolving to transaction signature
   */
  export async function sendSol(
    connection: Connection,
    payer: Keypair,
    destination: PublicKey,
    amount: number,
    options?: SendOptions & { commitment?: Commitment }
  ): Promise<string> {
    try {
      // Create transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: destination,
        lamports: amount,
      });
      
      // Use legacy or versioned transactions based on RPC support
      const useVersionedTransactions = await supportsVersionedTransactions(connection);
      
      if (useVersionedTransactions) {
        return await sendVersionedTransaction(
          connection,
          payer,
          [transferInstruction],
          options?.commitment || 'confirmed'
        );
      } else {
        // Create legacy transaction
        const transaction = new Transaction().add(transferInstruction);
        
        // Get recent blockhash
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash(
          options?.commitment || 'confirmed'
        );
        transaction.recentBlockhash = blockhash;
        transaction.lastValidBlockHeight = lastValidBlockHeight;
        transaction.feePayer = payer.publicKey;
        
        // Sign and send the transaction
        const signature = await sendAndConfirmTransaction(
          connection, 
          transaction, 
          [payer],
          options
        );
        return signature;
      }
    } catch (error) {
      console.error('Error in sendSol:', error);
      throw error;
    }
  }
  
  /**
   * Checks if the connection supports versioned transactions
   * @param connection - Solana connection
   * @returns Promise resolving to boolean
   */
  async function supportsVersionedTransactions(connection: Connection): Promise<boolean> {
    try {
      // Check if getLatestBlockhash returns a minContextSlot property
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash('confirmed');
      return typeof oncontextlost === 'number';
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Sends a versioned transaction
   * @param connection - Solana connection
   * @param payer - Keypair of the sender
   * @param instructions - Transaction instructions
   * @param commitment - Commitment level
   * @returns Promise resolving to transaction signature
   */
  async function sendVersionedTransaction(
    connection: Connection,
    payer: Keypair,
    instructions: TransactionInstruction[],
    commitment: Commitment = 'confirmed'
  ): Promise<string> {
    // Get blockhash
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash(commitment);
    
    // Create v0 transaction message
    const messageV0 = new TransactionMessage({
      payerKey: payer.publicKey,
      recentBlockhash: blockhash,
      instructions
    }).compileToV0Message();
    
    // Create versioned transaction
    const transaction = new VersionedTransaction(messageV0);
    
    // Sign transaction
    transaction.sign([payer]);
    
    // Send transaction
    const signature = await connection.sendTransaction(transaction, {

      skipPreflight: false,
      preflightCommitment: commitment,
      maxRetries: 3,
      oncontextlost
    });
    
    // Confirm transaction
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    }, commitment);
    
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
    }
    
    return signature;
  }
  
  /**
   * Get all token accounts for a wallet
   * @param connection - Solana connection
   * @param owner - Wallet public key
   * @returns Promise resolving to Array of { pubkey, account } objects
   */
  export async function getTokenAccounts(connection: Connection, owner: PublicKey) {
    const tokenAccounts = await connection.getTokenAccountsByOwner(
      owner,
      {
        programId: TOKEN_PROGRAM_ID,
      }
    );
  
    return tokenAccounts.value.map(({ pubkey, account }) => {
      const accountData = AccountLayout.decode(account.data);
      const { mint, amount } = accountData;
      
      return {
        pubkey,
        mint: new PublicKey(mint),
        amount: amount.toString(),
        decimals: 0, // This needs to be fetched separately
      };
    });
  }
  
  /**
   * Compute the optimal fee for a transaction
   * @param connection - Solana connection
   * @returns Promise resolving to the fee in lamports
   */
  export async function estimateTransactionFee(connection: Connection): Promise<number> {
    try {
      // Get recent prioritization fees
      const fees = await connection.getRecentPrioritizationFees();
      if (fees.length === 0) return 5000; // Default fee
      
      // Calculate the median fee from recent transactions
      const recentFees = fees.map(fee => fee.prioritizationFee);
      recentFees.sort((a, b) => a - b);
      
      const medianFee = recentFees[Math.floor(recentFees.length / 2)];
      
      // Add some padding for the base fee
      return medianFee + 5000;
    } catch (error) {
      console.error('Error estimating transaction fee:', error);
      return 5000; // Default fee
    }
  }