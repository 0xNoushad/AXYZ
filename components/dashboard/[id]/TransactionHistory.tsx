"use client";

import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownLeft, ArrowUpRight, Clock } from "lucide-react";
import { getTransactionHistory, Transaction as TxType } from "@/lib/transaction-utils";

interface TransactionHistoryProps {
  walletAddress: string;
}

/**
 * TransactionHistory component displays the wallet's transaction history
 * @param walletAddress - The wallet's address to check
 */
export function TransactionHistory({ walletAddress }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<TxType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Don't fetch if there's no wallet address
    if (!walletAddress) {
      setIsLoading(false);
      return;
    }
    
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        
        // Fetch real transaction data using our utility
        const txData = await getTransactionHistory(walletAddress, {
          limit: 10,
          useMainnet: true
        });
        
        setTransactions(txData);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTransactions();
  }, [walletAddress]);
  
  // Shorten address for display
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>Recent transactions for this wallet</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div 
                key={tx.signature} 
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center space-x-3">
                  <div className={`rounded-full p-2 ${tx.type === 'receive' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'}`}>
                    {tx.type === 'receive' ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {tx.type === 'receive' ? 'Received' : 'Sent'} {tx.amount.toFixed(4)} {tx.token}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <a 
                    href={`https://solscan.io/tx/${tx.txId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline"
                  >
                    View on Solscan
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-muted-foreground mb-2">No transactions found</p>
            <p className="text-sm text-muted-foreground">Transactions will appear here once you start using this wallet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}