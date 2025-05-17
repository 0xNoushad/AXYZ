"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type TimeRange = "24h" | "7d" | "30d" | "custom";

interface TimeRangeSelectorProps {
  onRangeChange: (range: TimeRange) => void;
}

export function TimeRangeSelector({ onRangeChange }: TimeRangeSelectorProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>("24h");

  const handleRangeChange = (range: TimeRange) => {
    setSelectedRange(range);
    onRangeChange(range);
  };

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: "24h", label: "Last 24 hours" },
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "custom", label: "Custom range" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex space-x-4 mb-6"
    >
      {timeRanges.map((range) => (
        <motion.button
          key={range.value}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleRangeChange(range.value)}
          className={cn(
            "px-3 py-1.5 text-sm rounded-md transition-colors",
            selectedRange === range.value
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:text-primary hover:bg-muted"
          )}
        >
          {range.label}
          {range.value === "custom" && (
            <span className="ml-1 opacity-60">↓</span>
          )}
        </motion.button>
      ))}
    </motion.div>
  );
}