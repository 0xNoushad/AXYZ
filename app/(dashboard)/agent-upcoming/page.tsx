"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
} from '@/components/ui/announcement';
import { ArrowUpRightIcon } from 'lucide-react';

const quotes = [
 "Discover new\nways to\ntrade.",
  "Crafting the\nfuture of\nagentic trading.",
  "Intelligence in\nevery\ntransaction.",
  "Your new trading\npartner is\nevolving.",
  "Almost ready\nto change\nthe game.",
];

/**
 * AgentUpcomingPage displays a series of cycling quotes to indicate a feature is coming soon.
 * It uses a minimalist design with blue text on a light gray background, styled with an Apple-system font.
 */
export default function AgentUpcomingPage() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 4000); // Change quote every 4 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-transparent p-6 text-[#3333d0]"
      style={{ fontFamily: '-apple-system, "system-ui", "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", Helvetica, "ヒラギノ角ゴ Pro W3", "Hiragino Kaku Gothic Pro", メイリオ, Meiryo, "ＭＳ Ｐゴシック", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuoteIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="text-center"
        >
          <p className="text-7xl md:text-8xl font-normal leading-tight whitespace-pre-line">
            {quotes[currentQuoteIndex]}
          </p>
        </motion.div>
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mt-16"
      >
        <Announcement themed className="bg-emerald-100 text-emerald-700">
          <AnnouncementTag>Soon</AnnouncementTag>
          <AnnouncementTitle>
            AXYZ Agent
            <ArrowUpRightIcon size={16} className="shrink-0 opacity-70" />
          </AnnouncementTitle>
        </Announcement>
      </motion.div>
    </div>
  );
}