"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { PublicKey } from "@solana/web3.js"
import { ArrowUpRight, ArrowDownLeft, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { ReceiveModal } from "@/components/dashboard/[id]/ReceiveModal"
import { SendModal } from "@/components/dashboard/[id]/SendModal"
import { toast } from "@/lib/use-toast"
import { getWalletTokensWithPrices, TokenInfo } from "@/lib/token-utils"
import { getTransactionHistory, Transaction } from "@/lib/transaction-utils"
import { CopyWallet } from "@/components/dashboard/[id]/copied-wallet"

// Interface for the keypair data stored in localStorage
interface KeypairData {
  id: number;
  name: string;
  publicKey: string;
  privateKey: string; // Ensure we're storing the private key
  created: string;
  balance?: number;
}

/**
 * WalletDashboardPage component displays the details of a specific user wallet,
 * including token holdings, recent transactions, and the copy trading interface.
 *
 * @returns JSX element for the wallet dashboard page.
 */
export default function WalletDashboardPage() {
  const router = useRouter()
  const params = useParams()
  // Decode the wallet ID from the URL parameter
  const walletId = decodeURIComponent(params.id as string)

  // State management for wallet data and UI elements
  const [walletName, setWalletName] = useState(walletId)
  const [keypairPublicKey, setKeypairPublicKey] = useState<PublicKey | null>(null)
  // State to store the private key, needed for signing transactions and copy trading
  const [keypairPrivateKey, setKeypairPrivateKey] = useState<string | null>(null);
  const [tokens, setTokens] = useState<TokenInfo[]>([])
  const [totalValue, setTotalValue] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoadingTokens, setIsLoadingTokens] = useState(true)
  const [isLoadingTxs, setIsLoadingTxs] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State management for modal visibility
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)

  // State to hold the target wallet address for copy trading, loaded from settings
  const [copiedWalletAddress, setCopiedWalletAddress] = useState("")

  /**
   * Effect to load the selected keypair (public and private keys) from localStorage
   * based on the walletId (which is the wallet name).
   */
  useEffect(() => {
    const storedKeypairs = localStorage.getItem("solanaKeypairs")
    if (storedKeypairs) {
      try {
        const parsedKeypairs: KeypairData[] = JSON.parse(storedKeypairs)
        // Find the keypair that matches the walletId (name)
        const selectedKeypair = parsedKeypairs.find(keypair => keypair.name === walletId)

        if (selectedKeypair) {
          setWalletName(selectedKeypair.name)
          setKeypairPublicKey(new PublicKey(selectedKeypair.publicKey))
          // Set the private key state
          setKeypairPrivateKey(selectedKeypair.privateKey);
        } else {
          console.error("Selected keypair not found in localStorage")
          toast({
            title: "Error",
            description: "Selected wallet not found",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error("Failed to parse stored keypairs:", error)
        toast({
          title: "Error",
          description: "Failed to load wallet data",
          variant: "destructive"
        })
      }
    }
  }, [walletId]) // Re-run effect if walletId changes

  /**
   * Effect to load the saved target wallet address for copy trading
   * from localStorage settings associated with the current user wallet.
   */
  useEffect(() => {
    if (keypairPublicKey) {
      const keypairId = keypairPublicKey.toString()
      // Load settings from the key specific to this user wallet
      const storedSettings = localStorage.getItem(`copyWalletSettings-${keypairId}`);
      if (storedSettings) {
        try {
          const parsedSettings = JSON.parse(storedSettings);
          // If targetWallet exists in settings, set it
          if (parsedSettings && parsedSettings.targetWallet) {
            setCopiedWalletAddress(parsedSettings.targetWallet);
          }
        } catch (e) {
          console.error("Error parsing stored copy wallet settings:", e);
        }
      }
    }
  }, [keypairPublicKey]) // Re-run effect if the user's public key is loaded

  /**
   * Effect to fetch token data (balances and prices) for the user's wallet.
   * Includes caching and a retry mechanism.
   */
  useEffect(() => {
    if (!keypairPublicKey) return; // Only fetch if public key is available

    const fetchTokenData = async (retryCount = 0) => {
      setIsLoadingTokens(true)
      setError(null)

      try {
        // Check for cached token data first
        const tokenCacheKey = `tokenCache-${keypairPublicKey.toString()}`
        const cachedTokens = localStorage.getItem(tokenCacheKey)

        // Use cached data initially while fetching fresh data for faster display
        if (cachedTokens) {
          try {
            const parsedCache = JSON.parse(cachedTokens)
            setTokens(parsedCache)

            // Calculate total value from cached tokens
            const totalCachedValue = parsedCache.reduce(
              (sum: number, token: TokenInfo) => sum + (token.totalValueInUSD || 0),
              0
            )
            setTotalValue(totalCachedValue)
          } catch (e) {
            console.error("Error parsing cached tokens:", e)
          }
        }

        console.log(`Dashboard: Fetching tokens for ${keypairPublicKey.toString()}`)
        // Fetch fresh token data with prices
        const result = await getWalletTokensWithPrices(keypairPublicKey.toString(), {
          useMainnet: true // Assuming mainnet for dashboard data
        });

        console.log(`Dashboard: Found ${result.tokens.length} tokens with total value: $${result.totalValue.toFixed(2)}`)

        // Enhance token objects with token account information needed for transfers
        const enhancedTokens = result.tokens.map(token => ({
          ...token,
          // Add the token account property if it doesn't exist (needed for SendModal)
          tokenAccount: token.tokenAccount || token.mint.toString(),
          // Add program ID if it doesn't exist (default to SPL-Token program ID)
          programId: token.programId || "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }));

        // Update state with fresh data
        setTokens(enhancedTokens);
        setTotalValue(result.totalValue);

        // Cache the fresh token data
        localStorage.setItem(tokenCacheKey, JSON.stringify(enhancedTokens));

      } catch (err) {
        console.error("Error fetching token data:", err);
        setError("Failed to load token data. Please try again later.");

        // Retry logic for transient errors (max 3 retries)
        if (retryCount < 3) {
          console.log(`Retrying token fetch (${retryCount + 1}/3)...`);
          setTimeout(() => fetchTokenData(retryCount + 1), 2000 * (retryCount + 1));
          return; // Stop execution here to wait for retry
        }

        // If retries fail and no cached data was available, set empty state
        if (tokens.length === 0) {
          setTokens([]);
          setTotalValue(0);
        }
      } finally {
        setIsLoadingTokens(false);
      }
    };

    fetchTokenData();

    // Set up a refresh interval for token data (every 30 seconds)
    const refreshInterval = setInterval(() => {
      fetchTokenData();
    }, 30000);

    // Cleanup interval on component unmount or public key change
    return () => clearInterval(refreshInterval);
  }, [keypairPublicKey]); // Re-run effect if public key changes

  /**
   * Effect to fetch recent transaction history for the user's wallet.
   * Includes a retry mechanism.
   */
  useEffect(() => {
    if (!keypairPublicKey) return; // Only fetch if public key is available

    const fetchTransactionHistory = async (retryCount = 0) => {
      setIsLoadingTxs(true);

      try {
        console.log(`Dashboard: Fetching transaction history for ${keypairPublicKey.toString()}`)
        const txHistory = await getTransactionHistory(keypairPublicKey.toString(), {
          limit: 10, // Fetch the last 10 transactions
          useMainnet: true // Assuming mainnet for dashboard data
        });

        console.log(`Dashboard: Found ${txHistory.length} transactions`)
        setTransactions(txHistory);
      } catch (err) {
        console.error("Error fetching transaction history:", err);

        // Retry logic for transient errors (max 3 retries)
        if (retryCount < 3) {
          console.log(`Retrying transaction fetch (${retryCount + 1}/3)...`);
          setTimeout(() => fetchTransactionHistory(retryCount + 1), 2000 * (retryCount + 1));
          return; // Stop execution here to wait for retry
        }

        // Fallback to empty transactions array if retries fail
        setTransactions([]);
      } finally {
        setIsLoadingTxs(false);
      }
    };

    fetchTransactionHistory();

    // Set up a refresh interval for transactions (every minute)
    const refreshInterval = setInterval(() => {
      fetchTransactionHistory();
    }, 60000);

    // Cleanup interval on component unmount or public key change
    return () => clearInterval(refreshInterval);
  }, [keypairPublicKey]); // Re-run effect if public key changes

  /**
   * Helper function to copy text to the clipboard and show a toast notification.
   * @param text - The text to copy.
   */
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    })
  }

  /**
   * Helper function to format a number as USD currency.
   * @param value - The number to format.
   * @returns Formatted USD string.
   */
  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  // Show loading state if the keypair (especially private key) hasn't been loaded yet
  if (!keypairPublicKey || keypairPrivateKey === null) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p>Loading wallet...</p>
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back to Wallets Navigation */}
        <div
          className="flex items-center mb-6 cursor-pointer hover:opacity-70 transition-opacity"
          onClick={() => router.push("/generate")}
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          <span className="text-sm">Back to Wallets</span>
        </div>

        {/* Wallet Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-semibold mb-2">{walletName}</h1>
            <div className="flex items-center space-x-2">
              {/* Display truncated public key */}
              <span className="text-sm text-muted-foreground truncate max-w-[200px]">{keypairPublicKey.toString()}</span>
              {/* Copy public key button */}
              <Copy
                className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => copyToClipboard(keypairPublicKey.toString())}
              />
              {/* Link to Solscan explorer */}
              <ExternalLink
                className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => window.open(`https://solscan.io/account/${keypairPublicKey.toString()}`, "_blank")}
              />
            </div>
          </div>
          {/* Action Buttons (Send/Receive) */}
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsSendModalOpen(true)}>
              Send
            </Button>
            <Button variant="outline" onClick={() => setIsReceiveModalOpen(true)}>
              Receive
            </Button>
          </div>
        </div>

        {/* Main Content Area - Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Token Holdings */}
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-lg font-semibold mb-4">Token Holdings</h2>
            {/* Loading state for tokens */}
            {isLoadingTokens ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              // Error state for tokens
              <div className="p-4 text-center text-red-500">
                <p>{error}</p>
              </div>
            ) : tokens.length > 0 ? (
              // Display token list if tokens are found
              <div className="space-y-3">
                {tokens.map((token) => (
                  <div
                    key={token.mint.toString()}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {/* Token Logo or Placeholder */}
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                        {token.logoURI ? (
                          <img
                            src={token.logoURI}
                            alt={token.symbol}
                            className="w-full h-full object-cover"
                            // Fallback to text if image fails to load
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
                      {/* Token Name and Symbol */}
                      <div>
                        <p className="font-medium">{token.name}</p>
                        <p className="text-xs text-muted-foreground">{token.symbol}</p>
                      </div>
                    </div>
                    {/* Token Amount and USD Value */}
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
              // Message when no tokens are found
              <div className="text-center py-8 text-muted-foreground">
                <p>No tokens found in this wallet</p>
                <p className="text-sm mt-2">Tokens will appear here once you receive them</p>
              </div>
            )}
          </div>

          {/* Right Column - Copy Trading Section */}
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-lg font-semibold mb-4">Copy Trading</h2>
            {/* Render the CopyWallet component, passing necessary wallet details */}
            {keypairPublicKey && keypairPrivateKey && (
              <CopyWallet
              keypairId={keypairPublicKey.toString()} // Use public key as a unique ID for settings
              publicKey={keypairPublicKey.toString()}
              privateKey={keypairPrivateKey}
              initialWalletAddress={copiedWalletAddress} // Pass the loaded target address
            />
            )}
          </div>
        </div>

        {/* Recent Transactions Section */}
        <div className="rounded-lg border bg-card p-4 mt-6">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          {/* Loading state for transactions */}
          {isLoadingTxs ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : transactions.length > 0 ? (
            // Display transaction list if transactions are found
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.signature}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {/* Transaction Type Icon */}
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${tx.type === "receive" ? "bg-green-500/10" : "bg-red-500/10"}`}
                    >
                      {tx.type === "receive" ? (
                        <ArrowDownLeft className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    {/* Transaction Details (Type, Token, Date) */}
                    <div>
                      <p className="font-medium">
                        {tx.type === "receive" ? "Receive" : "Send"}{" "}
                        <span className="text-xs text-muted-foreground">{tx.token}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{tx.date}</p>
                    </div>
                  </div>
                  {/* Transaction Amount and Status/Link */}
                  <div className="text-right">
                    <p className={`font-medium ${tx.type === "receive" ? "text-green-500" : ""}`}>
                      {tx.type === "receive" ? "+" : ""}
                      {tx.amount.toFixed(4)} {tx.token}
                    </p>
                    <div className="flex items-center justify-end space-x-2">
                      <p className="text-xs text-muted-foreground">confirmed</p>
                      {/* Link to transaction on Solscan */}
                      <ExternalLink
                        className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => window.open(`https://solscan.io/tx/${tx.txId}`, "_blank")}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Message when no transactions are found
            <div className="text-center py-8 text-muted-foreground">
              <p>No transactions found for this wallet</p>
              <p className="text-sm mt-2">Transactions will appear here once you send or receive tokens</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals for Send and Receive */}
      {keypairPublicKey && (
        <>
          <SendModal
            isOpen={isSendModalOpen}
            onClose={() => setIsSendModalOpen(false)}
            publicKey={keypairPublicKey}
            tokens={tokens} // Pass fetched tokens to SendModal
            walletId={walletId} // Pass walletId to retrieve private key in SendModal
          />
          <ReceiveModal
            isOpen={isReceiveModalOpen}
            onClose={() => setIsReceiveModalOpen(false)}
            publicKey={keypairPublicKey}
          />
        </>
      )}
    </>
  )
}
