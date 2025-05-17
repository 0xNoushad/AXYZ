"use client";
import { motion } from "framer-motion";
import { MarketOverview } from "@/components/home/MarketOverview";

export default function HomePage() {
  
  return (
    <div className="space-y-8 font-['Satoshi']">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-transparent border rounded-xl p-6 shadow-sm"
      >
        <h1 className="text-2xl font-medium">Home</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track and follow top traders on Solana.
        </p>
      </motion.div>

      {/* Price Charts Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-transparent border rounded-xl p-6 shadow-sm"
      >
        <MarketOverview />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        <div className="rounded-xl border bg-transparent p-6 shadow-sm flex flex-col h-[140px] justify-center">
          <h3 className="text-lg font-medium">Market Overview</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Current market trends
          </p>
          <div className="mt-auto text-xs text-muted-foreground">
            <span className="font-medium">Feature:</span> Track market data
          </div>
        </div>

        <div className="rounded-xl border bg-transparent p-6 shadow-sm flex flex-col h-[140px] justify-center">
          <h3 className="text-lg font-medium">Top Performers</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Highest return traders
          </p>
          <div className="mt-auto text-xs text-muted-foreground">
            <span className="font-medium">Feature:</span> Follow successful traders
          </div>
        </div>

        <div className="rounded-xl border bg-transparent p-6 shadow-sm flex flex-col h-[140px] justify-center">
          <h3 className="text-lg font-medium">Recent Activity</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Latest transactions
          </p>
          <div className="mt-auto text-xs text-muted-foreground">
            <span className="font-medium">Feature:</span> Monitor transactions
          </div>
        </div>
      </motion.div>
    </div>
  );
}