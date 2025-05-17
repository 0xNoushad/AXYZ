'use client';

import { FC, useState, useEffect, useCallback } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Transaction, VersionedTransaction, PublicKey, Keypair, Connection } from '@solana/web3.js'; // Import necessary Solana types
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Info, ExternalLink } from 'lucide-react'; // Ensure ExternalLink is imported
import { toast } from 'sonner'; // Using sonner for toasts
import { motion, AnimatePresence } from 'framer-motion';
import bs58 from 'bs58';
import { BotSettings } from "@/lib/types"; // Corrected import path

// Define constant values used throughout the component
const JUPITER_API = 'https://lite-api.jup.ag/swap/v1/'; // Jupiter API endpoint
const MAX_RECENT_TRADES_DISPLAY = 5; // Maximum number of recent trades to show in UI

// Define TypeScript interfaces for type safety

/**
 * Interface for token information.
 */
export interface Token {
  address: string;     // Token's contract address (mint address)
  symbol: string;      // Token's symbol (e.g., SOL, USDC)
  name: string;        // Token's full name
  decimals: number;    // Token's decimal places
  logoURI: string;     // URL for token's logo
}

/**
 * Interface for the quote response from Jupiter API.
 */
interface QuoteResponse {
  error: any;
  inputAmount: string;
  outputAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  priceImpactPct: number;
  routePlan: any[];
  contextSlot: number;
  // Add other relevant fields from Jupiter quote API
  swapInstruction: any; // Placeholder for the swap instruction
  // Assuming output token info might be available here or needs fetching
  outputMint: string; // Add outputMint from quote response
}

/**
 * Interface for transaction notifications (for bot's own trades).
 */
interface BotTradeNotification {
  txId: string;                    // Transaction ID of the bot's trade
  timestamp: number;               // When the trade occurred
  fromToken: string;              // Source token symbol (what the bot sold)
  toToken: string;                // Destination token symbol (what the bot bought)
  fromAmount: string;             // Amount sold (formatted string)
  toAmount: string;               // Amount bought (formatted string)
  status: 'success' | 'pending' | 'error'; // Transaction status
  targetTxId?: string;             // Optional: ID of the target wallet's transaction that triggered this trade
}

/**
 * Interface for Bot Settings.
 */
// Removed BotSettings interface definition from here

/**
 * Props for the SwapBot component.
 */
interface SwapBotProps {
  keypairId: string; // User's wallet public key string (used for context/storage)
  publicKey: string; // User's wallet public key string
  privateKey: string; // User's wallet private key string (base58 encoded)
  initialWalletAddress: string; // The target wallet address to copy
  isActive: boolean; // Whether the bot is currently active
  settings: BotSettings; // Bot configuration settings
}

/**
 * SwapBot component responsible for monitoring a target wallet and executing copy trades.
 *
 * @param keypairId - The current wallet's public key string.
 * @param publicKey - The public key of the user's wallet.
 * @param privateKey - The private key of the user's wallet (base58 encoded).
 * @param initialWalletAddress - The target wallet address to copy trades from.
 * @param isActive - Boolean indicating if the bot should be actively monitoring.
 * @param settings - Configuration settings for the bot.
 * @returns JSX element for the SwapBot UI.
 */
export const SwapBot: FC<SwapBotProps> = ({
  keypairId,
  publicKey,
  privateKey,
  initialWalletAddress,
  isActive,
  settings,
}) => {
  // Get Solana connection
  const { connection } = useConnection();

  // State management
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [botTrades, setBotTrades] = useState<BotTradeNotification[]>([]);
  const [monitoringStatus, setMonitoringStatus] = useState('Idle'); // e.g., 'Idle', 'Monitoring', 'Processing Trade', 'Error'
  const [error, setError] = useState('');

  // Create Keypair from private key - Memoized for stability
  const userKeypair = useCallback(() => {
    try {
      // Assuming privateKey is base58 encoded
      const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
      if (keypair.publicKey.toString() !== publicKey) {
         console.error("Private key does not match public key!");
         setError("Invalid wallet credentials provided.");
         return null;
      }
      return keypair;
    } catch (e) {
      console.error("Failed to create keypair from private key:", e);
      setError("Failed to load wallet credentials.");
      return null;
    }
  }, [privateKey, publicKey]);


  /**
   * Executes a copy trade based on detected activity on the target wallet.
   * This function fetches a quote from Jupiter, builds the transaction,
   * signs it with the user's private key, and sends it to the network.
   *
   * @param tokenToBuyMint - The mint address of the token the bot should buy.
   * @param amountToSpend - The amount of the input token (e.g., SOL) to spend.
   * @param inputTokenInfo - Information about the token being spent (e.g., SOL).
   * @param targetTxId - Optional: The transaction ID from the target wallet that triggered this trade.
   */
  const executeCopyTrade = useCallback(async (
    tokenToBuyMint: string,
    amountToSpend: number, // Amount in the input token (e.g., SOL)
    inputTokenInfo: { address: string; symbol: string; decimals: number; }, // Simplified token info needed for quote
    targetTxId?: string // Optional: ID of the target transaction
  ) => {
    const wallet = userKeypair();
    if (!wallet || !connection) {
      console.error("Wallet or connection not available for trade execution.");
      setError("Wallet or connection error during trade.");
      return;
    }

    setMonitoringStatus(`Processing trade for ${tokenToBuyMint.substring(0, 6)}...`);
    console.log(`Attempting to copy trade: Buy ${tokenToBuyMint} spending ${amountToSpend} ${inputTokenInfo.symbol}`);

    // Add a pending trade notification
    const pendingTxId = `pending-${Date.now()}`; // Temporary ID
    const newTrade: BotTradeNotification = {
      txId: pendingTxId,
      timestamp: Date.now(),
      fromToken: inputTokenInfo.symbol,
      toToken: tokenToBuyMint.substring(0, 6) + '...', // Use mint address initially
      fromAmount: amountToSpend.toFixed(inputTokenInfo.decimals), // Format based on input token decimals
      toAmount: '...',
      status: 'pending',
      targetTxId: targetTxId,
    };
    setBotTrades(prev => [newTrade, ...prev].slice(0, MAX_RECENT_TRADES_DISPLAY));


    try {
      // 1. Get Quote from Jupiter
      // Convert input amount to smallest units based on token decimals
      const amountInSmallestUnits = (amountToSpend * Math.pow(10, inputTokenInfo.decimals)).toFixed(0); // Use toFixed(0) for integer string

      const quoteParams = new URLSearchParams({
        inputMint: inputTokenInfo.address, // e.g., SOL mint
        outputMint: tokenToBuyMint, // The token the target wallet bought
        amount: amountInSmallestUnits,
        slippageBps: settings.slippageBps.toString(), // Use slippage from settings
        // Add other parameters like `onlyDirectRoutes` if needed
      });

      console.log(`Fetching quote: ${JUPITER_API}/quote?${quoteParams.toString()}`);
      const quoteResponse = await fetch(`${JUPITER_API}/quote?${quoteParams}`);
      const quoteData: QuoteResponse = await quoteResponse.json();

      if (quoteData.error) {
        throw new Error(`Quote error: ${quoteData.error.message || JSON.stringify(quoteData.error)}`);
      }

      console.log("Received quote:", quoteData);

      // 2. Get Swap Transaction from Jupiter
      console.log(`Fetching swap transaction: ${JUPITER_API}/swap`);
      const swapResponse = await fetch(`${JUPITER_API}/swap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
           quoteResponse: quoteData,
           userPublicKey: wallet.publicKey.toString(),
           wrapAndUnwrapSol: true, // Automatically wrap/unwrap SOL
        }),
      });

      const swapData = await swapResponse.json();

      if (swapData.error) {
         throw new Error(`Swap transaction error: ${swapData.error.message || JSON.stringify(swapData.error)}`);
      }

      console.log("Received swap transaction:", swapData);

      // 3. Deserialize and Sign Transaction
      const swapTransaction = VersionedTransaction.deserialize(Buffer.from(swapData.swapTransaction, 'base64'));

      // Sign the transaction using the user's private key
      swapTransaction.sign([wallet]);

      // 4. Send and Confirm Transaction
      console.log("Sending transaction...");
      const rawTransaction = swapTransaction.serialize();
      const txid = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true, // Set to false in production after thorough testing
        maxRetries: 2,
      });

      console.log(`Transaction sent: ${txid}`);

      // Update the pending trade notification with the actual txId
      setBotTrades(prev => prev.map(trade =>
        trade.txId === pendingTxId ? { ...trade, txId: txid, status: 'pending' } : trade
      ));

      // Wait for confirmation (optional but recommended for reliability)
      console.log("Confirming transaction...");
      const confirmation = await connection.confirmTransaction(txid, 'confirmed'); // Or 'finalized'

      if (confirmation.value.err) {
        console.error("Transaction failed:", confirmation.value.err);
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      console.log("Transaction confirmed!");

      // Calculate received amount and update trade notification status to success
      // Note: Getting the exact received amount might require parsing the confirmed transaction logs
      // or relying on the quote's outputAmount (which can vary due to slippage).
      // For simplicity here, we'll use the quote's outputAmount for display.
      const receivedAmount = Number(quoteData.outputAmount) / Math.pow(10, quoteData.routePlan[0].swapInfo.outToken.decimals); // Assuming decimals are available in routePlan or fetched separately

      setBotTrades(prev => prev.map(trade =>
        trade.txId === txid ? {
          ...trade,
          status: 'success',
          toToken: quoteData.outputMint.substring(0, 6) + '...', // Use outputMint from quote
          toAmount: receivedAmount.toFixed(4) // Format received amount
        } : trade
      ));

      setMonitoringStatus(`Monitoring ${initialWalletAddress}...`); // Go back to monitoring status

    } catch (err) {
      console.error('Trade execution error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during trade execution.';

      // Update the trade notification status to error
       setBotTrades(prev => prev.map(trade =>
         trade.txId === pendingTxId || trade.txId === (err as any).txid // Handle case where txid is available in error
           ? { ...trade, status: 'error', toAmount: 'N/A', toToken: 'Error', txId: (err as any).txid || pendingTxId }
           : trade
       ));

      setError(errorMessage);
      setMonitoringStatus(`Error: ${errorMessage}`); // Show error in status
    }
  }, [connection, initialWalletAddress, settings, userKeypair]); // Depend on connection, target address, settings, and keypair function


  // Effect hook to start/stop monitoring based on isActive prop
  useEffect(() => {
    let monitorInterval: NodeJS.Timeout | undefined;
    // let subscriptionId: number | undefined; // For WebSocket approach

    const startMonitoring = async () => {
      if (!initialWalletAddress || !PublicKey.isOnCurve(new PublicKey(initialWalletAddress))) {
        setMonitoringStatus('Invalid Target Address');
        setError('Please provide a valid target wallet address.');
        return;
      }

      const wallet = userKeypair();
      if (!wallet) {
         setMonitoringStatus('Wallet Error');
         setError('Failed to load your wallet credentials.');
         return;
      }

      if (!connection) {
         setMonitoringStatus('Connection Error');
         setError('Solana connection not available.');
         return;
      }


      setIsMonitoring(true);
      setMonitoringStatus(`Monitoring ${initialWalletAddress}...`);
      setError('');
      console.log(`Starting monitoring for target wallet: ${initialWalletAddress}`);

      // --- IMPLEMENTATION REQUIRED: Actual Monitoring Logic ---
      // This is the core part where you watch the target wallet for transactions.
      // You need to implement logic here to:
      // 1. Fetch recent transactions for the `initialWalletAddress`.
      // 2. Parse these transactions to identify relevant trades (e.g., buys of new tokens).
      // 3. For each detected trade, determine the token bought and the amount spent (e.g., in SOL).
      // 4. Check if the detected trade meets your bot's criteria (e.g., minimum/maximum buy amount from `settings`).
      // 5. If criteria are met, call `executeCopyTrade(...)` with the appropriate parameters.
      // 6. Handle potential duplicate processing of the same transaction.

      // --- Example Polling Approach (Conceptual Pseudocode) ---
      // let lastSignature = ''; // Keep track of the last processed signature

      // const pollForTransactions = async () => {
      //   try {
      //     // Fetch recent signatures for the target wallet
      //     const signatures = await connection.getConfirmedSignaturesForAddress2(
      //       new PublicKey(initialWalletAddress),
      //       { limit: 10, before: lastSignature || undefined } // Fetch recent, or before last processed
      //     );

      //     if (signatures.length > 0) {
      //       // Process signatures in reverse order (oldest first) to maintain order
      //       const newSignatures = signatures.reverse();

      //       for (const sigInfo of newSignatures) {
      //         if (sigInfo.err) {
      //           console.warn(`Skipping failed transaction: ${sigInfo.signature}`);
      //           continue;
      //         }

      //         // Fetch the full transaction details
      //         const tx = await connection.getParsedTransactions(
      //           [sigInfo.signature],
      //           { maxSupportedTransactionVersion: 0 } // Or 0 if using legacy
      //         );

      //         if (tx && tx[0]) {
      //           // --- Transaction Parsing Logic Required ---
      //           // Parse tx[0] to identify token swaps.
      //           // Look for instructions related to SPL Token or AMM interactions (like Jupiter, Raydium, etc.).
      //           // Determine the input token (e.g., SOL/USDC) and the output token (the new token bought).
      //           // Determine the amount spent by the target wallet.

      //           const detectedTrade = {
      //             tokenToBuyMint: '...', // Extract from transaction
      //             amountSpent: 0, // Extract from transaction (in input token units)
      //             inputTokenInfo: { address: 'So11111111111111111111111111111111111111112', symbol: 'SOL', decimals: 9 }, // Info for SOL or other input token
      //             targetTxId: sigInfo.signature,
      //           };

      //           // --- Criteria Check ---
      //           if (detectedTrade.amountSpent >= settings.minimumBuyAmount && detectedTrade.amountSpent <= settings.maximumBuyAmount) {
      //             console.log("Detected trade matching criteria:", detectedTrade);
      //             // Execute the copy trade
      //             executeCopyTrade(
      //               detectedTrade.tokenToBuyMint,
      //               detectedTrade.amountSpent,
      //               detectedTrade.inputTokenInfo,
      //               detectedTrade.targetTxId
      //             );
      //           } else {
      //              console.log("Detected trade outside criteria:", detectedTrade);
      //           }
      //         }
      //       }
      //       // Update lastSignature after processing
      //       lastSignature = newSignatures[newSignatures.length - 1]?.signature || lastSignature;
      //     }

      //   } catch (e) {
      //     console.error("Error during monitoring poll:", e);
      //     // Handle monitoring errors, maybe set a status or error message
      //     setMonitoringStatus(`Monitoring Error: ${e instanceof Error ? e.message : 'Unknown error'}`);
      //   }
      // };

      // // Start polling
      // monitorInterval = setInterval(pollForTransactions, 5000); // Poll every 5 seconds (adjust as needed)

      // --- Alternative: WebSocket Approach (More Complex) ---
      // This would involve subscribing to logs or signatures via WebSocket.
      // connection.onLogs(new PublicKey(initialWalletAddress), (logs, context) => {
      //   // Parse logs to identify swap instructions
      //   // Call executeCopyTrade if a relevant trade is found
      // }, 'confirmed');


      // For now, just indicate that monitoring is conceptually active.
      setMonitoringStatus(`Monitoring ${initialWalletAddress}... (Logic Pending)`);

    };

    const stopMonitoring = () => {
      console.log("Stopping monitoring...");
      setIsMonitoring(false);
      setMonitoringStatus('Idle');
      setError('');
      // Clear any intervals or subscriptions
      if (monitorInterval) clearInterval(monitorInterval);
      // if (subscriptionId !== undefined) {
      //   try {
      //     connection?.removeAccountChangeListener(subscriptionId); // Use optional chaining
      //     console.log(`Removed subscription ID: ${subscriptionId}`);
      //   } catch (e) {
      //     console.error("Error removing subscription:", e);
      //   }
      // }
    };

    if (isActive) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    // Cleanup function
    return () => {
      console.log("Cleanup: Stopping monitoring on unmount/isActive change");
      stopMonitoring(); // Ensure monitoring stops when component unmounts or isActive changes
    };

  }, [isActive, initialWalletAddress, connection, userKeypair, executeCopyTrade, settings]); // Depend on isActive, target address, connection, keypair function, executeCopyTrade, and settings


  // If the bot is not active, display a message
  if (!isActive) {
    return (
      <div className="text-center text-muted-foreground">
        Bot is inactive. Toggle the switch above to start monitoring.
      </div>
    );
  }

  // If active but no target wallet or invalid
   if (!initialWalletAddress || !PublicKey.isOnCurve(new PublicKey(initialWalletAddress))) {
     return (
       <div className="text-center text-red-500">
         Bot cannot start: Invalid or missing target wallet address.
       </div>
     );
   }

   // If active but wallet credentials failed
   if (!userKeypair()) {
      return (
        <div className="text-center text-red-500">
          Bot cannot start: Failed to load your wallet credentials.
        </div>
      );
   }

   // If active but connection is not ready
   if (!connection) {
       return (
         <div className="text-center text-red-500">
           Bot cannot start: Solana connection not ready.
         </div>
       );
    }


  return (
    <div className="space-y-4">
      {/* Bot Status */}
      <div>
        <p className="text-sm font-medium">Status:</p>
        <p className={`text-sm ${monitoringStatus.startsWith('Error') ? 'text-red-500' : monitoringStatus.startsWith('Monitoring') ? 'text-green-500' : 'text-yellow-500'}`}>
          {monitoringStatus}
        </p>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      {/* Recent Bot Trades */}
      <div>
        <h4 className="text-md font-medium mb-2">Recent Bot Trades</h4>
        {botTrades.length === 0 ? (
          <p className="text-sm text-muted-foreground">No trades executed by the bot yet.</p>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {botTrades.map((trade) => (
                <motion.div
                  key={trade.txId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-3 rounded-md border text-sm ${trade.status === 'success' ? 'border-green-500/50 bg-green-500/10' : trade.status === 'error' ? 'border-red-500/50 bg-red-500/10' : 'border-yellow-500/50 bg-yellow-500/10'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">
                      {trade.status === 'pending' ? 'Pending' : trade.status === 'success' ? 'Bought' : 'Error'} {trade.toToken}
                    </span>
                    <span className="text-xs text-muted-foreground">
                       {new Date(trade.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {trade.status === 'success' ? `Spent ${trade.fromAmount} ${trade.fromToken} to get ${trade.toAmount} ${trade.toToken}` :
                     trade.status === 'pending' ? `Attempting to spend ${trade.fromAmount} ${trade.fromToken}` :
                     `Failed to trade ${trade.fromToken}`}
                  </p>
                   <a
                     href={`https://solscan.io/tx/${trade.txId}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-xs text-blue-500 hover:underline flex items-center mt-1"
                   >
                     View Transaction <ExternalLink className="ml-1 h-3 w-3" />
                   </a>
                   {trade.targetTxId && (
                      <a
                        href={`https://solscan.io/tx/${trade.targetTxId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline flex items-center mt-1"
                      >
                        Triggered by Target Tx <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                   )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* You can add more UI elements here for bot controls or stats */}
    </div>
  );
};