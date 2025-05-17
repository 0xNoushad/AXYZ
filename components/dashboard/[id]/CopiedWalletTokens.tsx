import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Copy, ExternalLink, RefreshCw, ArrowDownLeft } from "lucide-react"
import { toast } from "@/lib/use-toast"
import { TokenInfo } from "@/lib/token-utils"
import { PublicKey } from "@solana/web3.js"

interface CopiedWalletTokensProps {
  isOpen: boolean
  onClose: () => void
  walletAddress: string
  tokens: TokenInfo[]
  isLoading: boolean
  onRefresh: () => void
  onCopyToken: (token: TokenInfo) => void
}

export function CopiedWalletTokens({
  isOpen,
  onClose,
  walletAddress,
  tokens,
  isLoading,
  onRefresh,
  onCopyToken
}: CopiedWalletTokensProps) {
  const [sortedTokens, setSortedTokens] = useState<TokenInfo[]>([])
  const [sortBy, setSortBy] = useState<'value' | 'name' | 'balance'>('value')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Format USD value
  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  // Format token amount with appropriate decimals
  const formatAmount = (amount: number, decimals: number = 6) => {
    if (amount === 0) return '0'
    
    // For very small numbers, show scientific notation
    if (amount < 0.000001) {
      return amount.toExponential(2)
    }
    
    // For normal numbers, show appropriate decimals
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    }).format(amount)
  }

  // Copy address to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    })
  }

  // Sort tokens based on current sort settings
  useEffect(() => {
    if (!tokens || tokens.length === 0) {
      setSortedTokens([])
      return
    }

    const sorted = [...tokens].sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'value':
          comparison = (a.totalValueInUSD || 0) - (b.totalValueInUSD || 0)
          break
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '')
          break
        case 'balance':
          comparison = (a.amount || 0) - (b.amount || 0)
          break
      }
      
      return sortDirection === 'asc' ? comparison : -comparison
    })
    
    setSortedTokens(sorted)
  }, [tokens, sortBy, sortDirection])

  // Toggle sort direction or change sort field
  const handleSort = (field: 'value' | 'name' | 'balance') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDirection('desc')
    }
  }

  // Calculate total portfolio value
  const totalValue = tokens.reduce((sum, token) => sum + (token.totalValueInUSD || 0), 0)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Copied Wallet Tokens</DialogTitle>
          <DialogDescription>
            Viewing tokens for wallet: <span className="font-mono text-xs">{walletAddress}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 ml-2" 
              onClick={() => copyToClipboard(walletAddress)}
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={() => window.open(`https://solscan.io/account/${walletAddress}`, "_blank")}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium">Total Value: {formatUSD(totalValue)}</h3>
            <p className="text-sm text-muted-foreground">{tokens.length} tokens found</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2 mb-4">
          <Badge 
            variant={sortBy === 'value' ? 'default' : 'outline'} 
            className="cursor-pointer"
            onClick={() => handleSort('value')}
          >
            Value {sortBy === 'value' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Badge>
          <Badge 
            variant={sortBy === 'name' ? 'default' : 'outline'} 
            className="cursor-pointer"
            onClick={() => handleSort('name')}
          >
            Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Badge>
          <Badge 
            variant={sortBy === 'balance' ? 'default' : 'outline'} 
            className="cursor-pointer"
            onClick={() => handleSort('balance')}
          >
            Balance {sortBy === 'balance' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Badge>
        </div>

        {/* Token List */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading skeletons
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-20 ml-auto" />
                  <Skeleton className="h-3 w-12 ml-auto" />
                </div>
              </div>
            ))
          ) : sortedTokens.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tokens found in this wallet</p>
            </div>
          ) : (
            sortedTokens.map((token) => (
              <Card key={token.mint.toString()} className="overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {token.logoURI ? (
                      <img 
                        src={token.logoURI} 
                        alt={token.symbol} 
                        className="h-10 w-10 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xs font-bold">{token.symbol?.substring(0, 2) || '??'}</span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium">{token.name || token.symbol || 'Unknown Token'}</h4>
                      <p className="text-sm text-muted-foreground">{token.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatAmount(token.amount || 0, token.decimals)}</p>
                    <p className="text-sm text-muted-foreground">
                      {token.totalValueInUSD ? formatUSD(token.totalValueInUSD) : 'N/A'}
                    </p>
                  </div>
                </div>
                <CardFooter className="bg-muted/50 py-2 px-4 flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8"
                    onClick={() => onCopyToken(token)}
                  >
                    <ArrowDownLeft className="h-4 w-4 mr-2" />
                    Copy Token
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 ml-2"
                    onClick={() => window.open(`https://solscan.io/token/${token.mint.toString()}`, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}