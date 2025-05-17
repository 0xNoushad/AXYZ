"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
 
import { ActionSearchBar } from "./how-it-works/action-search";
import Path from "./how-it-works/path";
import { DisplayCardsDemo } from "./how-it-works/display";
import { AXYZ } from "./how-it-works/axyz";
import { GlowingKeyboard } from "./how-it-works/keyboard";
 
export function HowItWorksSection() {
  return (
    <section className="w-full max-w-7xl mx-auto py-24 px-4">
      <div className="text-center mb-16">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-primary/10 text-primary mb-4"
        >
          <Sparkles className="mr-1 h-3 w-3" />
          Solana Trading
        </motion.span>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          How it works
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-muted-foreground text-lg max-w-2xl mx-auto"
        >
          Trade with confidence on Solana's fastest and most secure platform
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top row - Path and AXYZ side by side */}
        <div className="rounded-xl border bg-transparent overflow-hidden flex items-center justify-center p-4">
          <Path />
        </div>

        <div className="rounded-xl border bg-transparent overflow-hidden flex items-center justify-center p-4">
          <AXYZ />
        </div>

        {/* Middle row - Glowing Keyboard spanning full width */}
        <div className="rounded-xl border bg-transparent overflow-hidden md:col-span-2 flex items-center justify-center p-4">
          <GlowingKeyboard
            glowColor="#10B981" // Changed from red to green
            highlight={[
              {
                startRow: 2,
                startIndex: 1,
                text: ["T", "R", "A", "D", "E", "", "N", "I", "O"],
              },
              {
                startRow: 4,
                startIndex: 2,
                text: ["S", "O", "L", "A", "N", "A"],
              },
            ]}
          />
        </div>

        {/* Bottom row - Search and Display side by side */}
        <div className="rounded-xl border bg-transparent overflow-hidden flex items-center justify-center p-4">
          <ActionSearchBar />
        </div>

        <div className="rounded-xl border bg-transparent overflow-hidden flex items-center justify-center p-4">
          <DisplayCardsDemo />
        </div>
      </div>
    </section>
  );
}