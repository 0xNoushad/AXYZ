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
import { CopyWallet } from "@/components/dashboard/[id]/copied-wallet"
import { getWalletTokensWithPrices, TokenInfo } from "@/lib/token-utils"
import { getTransactionHistory, Transaction } from "@/lib/transaction-utils"

// Interface for the keypair data stored in localStorage
interface KeypairData {
  id: number;
  name: string;
  publicKey: string;
  privateKey: string; // Ensure we're storing the private key
  created: string;
  balance?: number;
}

export default function WalletDashboardPage() {
  const router = useRouter()
  const params = useParams()
  const walletId = decodeURIComponent(params.id as string)
 
  // State management
  const [walletName, setWalletName] = useState(walletId)
  const [keypairPublicKey, setKeypairPublicKey] = useState<PublicKey | null>(null)
  const [tokens, setTokens] = useState<TokenInfo[]>([])
  const [totalValue, setTotalValue] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoadingTokens, setIsLoadingTokens] = useState(true)
  const [isLoadingTxs, setIsLoadingTxs] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state management
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)

  // Copy wallet state
  const [copiedWalletAddress, setCopiedWalletAddress] = useState("")

  // Load selected keypair from localStorage based on the walletId
  useEffect(() => {
    const storedKeypairs = localStorage.getItem("solanaKeypairs")
    if (storedKeypairs) {
      try {
        const parsedKeypairs: KeypairData[] = JSON.parse(storedKeypairs)
        // Find the keypair that matches the walletId (which should be the name)
        const selectedKeypair = parsedKeypairs.find(keypair => keypair.name === walletId)
        
        if (selectedKeypair) {
          setWalletName(selectedKeypair.name)
          setKeypairPublicKey(new PublicKey(selectedKeypair.publicKey))
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
      }
    }
  }, [walletId])

  // Load copied wallet from localStorage on component mount
  useEffect(() => {
    if (keypairPublicKey) {
      const keypairId = keypairPublicKey.toString()
      const storedWallets = localStorage.getItem(`copyWallets-${keypairId}`)
      if (storedWallets) {
        try {
          const wallets = JSON.parse(storedWallets)
          if (wallets.length > 0) {
            setCopiedWalletAddress(wallets[0].address)
          }
        } catch (e) {
          console.error("Error parsing copied wallets:", e)
        }
      }
    }
  }, [keypairPublicKey])

  // Enhanced token fetching with retry mechanism and better caching
  useEffect(() => {
    if (!keypairPublicKey) return;
    
    const fetchTokenData = async (retryCount = 0) => {
      setIsLoadingTokens(true)
      setError(null)
      
      try {
        // Check for cached token data first
        const tokenCacheKey = `tokenCache-${keypairPublicKey.toString()}`
        const cachedTokens = localStorage.getItem(tokenCacheKey)
        
        // Use cached data initially while fetching fresh data
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
        const result = await getWalletTokensWithPrices(keypairPublicKey.toString(), {
          useMainnet: true
        });
        
        console.log(`Dashboard: Found ${result.tokens.length} tokens with total value: $${result.totalValue.toFixed(2)}`)
        
        // Enhance token objects with token account information needed for transfers
        const enhancedTokens = result.tokens.map(token => ({
          ...token,
          // Add the token account property if it doesn't exist
          tokenAccount: token.tokenAccount || token.mint.toString(),
          // Add program ID if it doesn't exist
          programId: token.programId || "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" // Default SPL-Token program ID
        }));
        
        setTokens(enhancedTokens);
        setTotalValue(result.totalValue);
        
        // Cache the token data for the keypair
        localStorage.setItem(tokenCacheKey, JSON.stringify(enhancedTokens)); === 'boolean')
        
      } catch (err) {
        console.error("Error fetching token data:", err);
        setError("Failed to load token data. Please try again later.");
        
        // Retry logic for transient errors (max 3 retries)
        if (retryCount < 3) {
          console.log(`Retrying token fetch (${retryCount + 1}/3)...`);
          setTimeout(() => fetchTokenData(retryCount + 1), 2000 * (retryCount + 1));
          return;
        }
        
        // If no cached data, set empty tokens array as fallback
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
    
    return () => clearInterval(refreshInterval);
  }, [keypairPublicKey]);

  // Enhanced transaction history fetching with retry mechanism
  useEffect(() => {
    if (!keypairPublicKey) return;
    
    const fetchTransactionHistory = async (retryCount = 0) => {
      setIsLoadingTxs(true);
      
      try {
        console.log(`Dashboard: Fetching transaction history for ${keypairPublicKey.toString()}`)
        const txHistory = await getTransactionHistory(keypairPublicKey.toString(), {
          limit: 10,
          useMainnet: true
        });
        
        console.log(`Dashboard: Found ${txHistory.length} transactions`)
        setTransactions(txHistory);
      } catch (err) {
        console.error("Error fetching transaction history:", err);
        
        // Retry logic for transient errors (max 3 retries)
        if (retryCount < 3) {
          console.log(`Retrying transaction fetch (${retryCount + 1}/3)...`);
          setTimeout(() => fetchTransactionHistory(retryCount + 1), 2000 * (retryCount + 1));
          return;
        }
        
        // Fallback to empty transactions array
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
    
    return () => clearInterval(refreshInterval);
  }, [keypairPublicKey]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    })
  }

  // Format USD value
  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  // If keypair hasn't been loaded yet, show loading state
  if (!keypairPublicKey) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p>Loading wallet...</p>
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back to Wallets */}
        <div
          className="flex items-center mb-6 cursor-pointer hover:opacity-70 transition-opacity"
          onClick={() => router.push("/generate")}
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          <span className="text-sm">Back to Wallets</span>
        </div>

        {/* Wallet Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-semibold mb-2">{walletName}</h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground truncate max-w-[200px]">{keypairPublicKey.toString()}</span>
              <Copy
                className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => copyToClipboard(keypairPublicKey.toString())}
              />
              <ExternalLink
                className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => window.open(`https://solscan.io/account/${keypairPublicKey.toString()}`, "_blank")}
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsSendModalOpen(true)}>
              Send
            </Button>
            <Button variant="outline" onClick={() => setIsReceiveModalOpen(true)}>
              Receive
            </Button>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Token Holdings */}
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-lg font-semibold mb-4">Token Holdings</h2>
            {isLoadingTokens ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                <p>{error}</p>
              </div>
            ) : tokens.length > 0 ? (
              <div className="space-y-3">
                {tokens.map((token) => (
                  <div
                    key={token.mint.toString()}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
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
                        <p className="font-medium">{token.name}</p>
                        <p className="text-xs text-muted-foreground">{token.symbol}</p>
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
              <div className="text-center py-8 text-muted-foreground">
                <p>No tokens found in this wallet</p>
                <p className="text-sm mt-2">Tokens will appear here once you receive them</p>
              </div>
            )}
          </div>

          {/* Right Column - Copy Wallet */}
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-lg font-semibold mb-4">Copy Trading</h2>
            <Tabs defaultValue="overview">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tokens">Tokens</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="copy-trading">Copy Trading</TabsTrigger>
              </TabsList>
              
              {isLoadingTxs ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.signature}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${tx.type === "receive" ? "bg-green-500/10" : "bg-red-500/10"}`}
                        >
                          {tx.type === "receive" ? (
                            <ArrowDownLeft className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {tx.type === "receive" ? "Receive" : "Send"}{" "}
                            <span className="text-xs text-muted-foreground">{tx.token}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">{tx.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${tx.type === "receive" ? "text-green-500" : ""}`}>
                          {tx.type === "receive" ? "+" : ""}
                          {tx.amount.toFixed(4)} {tx.token}
                        </p>
                        <div className="flex items-center justify-end space-x-2">
                          <p className="text-xs text-muted-foreground">confirmed</p>
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
                <div className="text-center py-8 text-muted-foreground">
                  <p>No transactions found for this wallet</p>
                  <p className="text-sm mt-2">Transactions will appear here once you send or receive tokens</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-lg border bg-card p-4 mt-6">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          {isLoadingTxs ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.signature}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${tx.type === "receive" ? "bg-green-500/10" : "bg-red-500/10"}`}
                    >
                      {tx.type === "receive" ? (
                        <ArrowDownLeft className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {tx.type === "receive" ? "Receive" : "Send"}{" "}
                        <span className="text-xs text-muted-foreground">{tx.token}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${tx.type === "receive" ? "text-green-500" : ""}`}>
                      {tx.type === "receive" ? "+" : ""}
                      {tx.amount.toFixed(4)} {tx.token}
                    </p>
                    <div className="flex items-center justify-end space-x-2">
                      <p className="text-xs text-muted-foreground">confirmed</p>
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
            <div className="text-center py-8 text-muted-foreground">
              <p>No transactions found for this wallet</p>
              <p className="text-sm mt-2">Transactions will appear here once you send or receive tokens</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {keypairPublicKey && (
        <>
          <SendModal
            isOpen={isSendModalOpen}
            onClose={() => setIsSendModalOpen(false)}
            publicKey={keypairPublicKey}
            tokens={tokens}
            walletId={walletId}
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