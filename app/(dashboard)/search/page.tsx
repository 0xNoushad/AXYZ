"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="mt-2 text-muted-foreground">
          Find traders, assets, and strategies
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="relative">
          <input
            type="text"
            placeholder="Search for assets, topics, or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-lg">
            🔍
          </div>
        </div>
      </motion.div>
      
      {!searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 text-center text-muted-foreground"
        >
          <p className="text-lg">Search for assets, topics, or users</p>
          <p className="mt-2">Try searching for "Solana", "DeFi", or specific wallet addresses</p>
        </motion.div>
      )}
    </div>
  );
}