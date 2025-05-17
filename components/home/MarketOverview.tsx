"use client";
import { useState } from "react";
import { SolPriceChart } from "./SolPriceChart";
import { TopTokens } from "./TopTokens";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarketOverview() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Market Overview</h2>
        <Button 
          onClick={handleRefresh}
          variant="ghost" 
          size="sm"
          className="h-8 gap-1 text-muted-foreground hover:text-primary"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 gap-8 lg:grid-cols-2"
      >
        <SolPriceChart />
        <TopTokens />
      </motion.div>
    </div>
  );
}