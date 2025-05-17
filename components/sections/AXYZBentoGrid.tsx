"use client";

import { cn } from "@/lib/utils";
import {
  Wallet,
  BarChart3,
  Shield,
  Zap,
  ArrowUpRight,
  Trophy,
  Sparkles
} from "lucide-react";

export interface BentoItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  status?: string;
  tags?: string[];
  meta?: string;
  cta?: string;
  colSpan?: number;
  hasPersistentHover?: boolean;
}

interface AXYZBentoGridProps {
  items?: BentoItem[];
}

const axyzFeatures: BentoItem[] = [
  {
    title: "Secure Wallet Authentication",
    meta: "Solana Powered",
    description:
      "Connect your Solana wallet for secure, passwordless authentication with blockchain-based verification",
    icon: <Shield className="w-4 h-4 text-[#14F195]" />,
    status: "Secure",
    tags: ["Authentication", "Solana", "Web3"],
    colSpan: 2,
    hasPersistentHover: true,
  },
  {
    title: "Real-time Trading",
    meta: "Low Latency",
    description: "Execute trades with minimal delay using our optimized Solana integration",
    icon: <Zap className="w-4 h-4 text-amber-500" />,
    status: "Fast",
    tags: ["Trading", "Performance"],
  },
  {
    title: "Portfolio Management",
    meta: "All-in-one",
    description: "Track and manage all your Solana assets in a single, intuitive dashboard",
    icon: <Wallet className="w-4 h-4 text-purple-500" />,
    tags: ["Assets", "Portfolio"],
    colSpan: 2,
  },
  {
    title: "Advanced Analytics",
    meta: "Data-driven",
    description: "Make informed decisions with comprehensive market analytics and insights",
    icon: <BarChart3 className="w-4 h-4 text-sky-500" />,
    status: "Insights",
    tags: ["Analytics", "Market Data"],
  },
  {
    title: "Token Swaps",
    meta: "Instant Exchange",
    description: "Swap between tokens with minimal slippage and competitive rates",
    icon: <ArrowUpRight className="w-4 h-4 text-rose-500" />,
    status: "Live",
    tags: ["DEX", "Swaps"],
  },
  {
    title: "Top Traders",
    meta: "Community Leaders",
    description: "Follow and learn from the most successful traders on our platform",
    icon: <Trophy className="w-4 h-4 text-yellow-500" />,
    status: "Featured",
    tags: ["Social", "Learning"],
    colSpan: 2,
  },
];

export function AXYZBentoGrid({ items = axyzFeatures }: AXYZBentoGridProps) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold mb-3 flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AXYZ Trading
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Our platform combines the power of Solana blockchain with intuitive design to provide a seamless trading and portfolio management experience.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 max-w-7xl mx-auto">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "group relative p-4 rounded-xl overflow-hidden transition-all duration-300",
              "border border-gray-100/80 dark:border-white/10 bg-white dark:bg-black",
              "hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.03)]",
              "hover:-translate-y-0.5 will-change-transform",
              item.colSpan === 2 ? "md:col-span-2" : "col-span-1",
              {
                "shadow-[0_2px_12px_rgba(0,0,0,0.03)] -translate-y-0.5":
                  item.hasPersistentHover,
                "dark:shadow-[0_2px_12px_rgba(255,255,255,0.03)]":
                  item.hasPersistentHover,
              }
            )}
          >
            <div
              className={`absolute inset-0 ${
                item.hasPersistentHover
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              } transition-opacity duration-300`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4px_4px]" />
            </div>

            <div className="relative flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/10 group-hover:bg-gradient-to-br transition-all duration-300">
                  {item.icon}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-1 rounded-lg backdrop-blur-sm",
                    "bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300",
                    "transition-colors duration-300 group-hover:bg-black/10 dark:group-hover:bg-white/20"
                  )}
                >
                  {item.status || "Active"}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 tracking-tight text-[15px]">
                  {item.title}
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 font-normal">
                    {item.meta}
                  </span>
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-snug font-[425]">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  {item.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-md bg-black/5 dark:bg-white/10 backdrop-blur-sm transition-all duration-200 hover:bg-black/10 dark:hover:bg-white/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.cta || "Explore →"}
                </span>
              </div>
            </div>

            <div
              className={`absolute inset-0 -z-10 rounded-xl p-px bg-gradient-to-br from-transparent via-gray-100/50 to-transparent dark:via-white/10 ${
                item.hasPersistentHover
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              } transition-opacity duration-300`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}