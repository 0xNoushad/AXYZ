 
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");

  // Calculate prices based on billing cycle
  const getPrice = (monthly: string, annually: string) => {
    return billingCycle === "monthly" ? monthly : annually;
  };

  return (
    <section className="flex w-full max-w-4xl flex-col items-center gap-8">
      <div className="text-center">
        <motion.h2 
          className="text-2xl font-semibold"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Tailored pricing packages
        </motion.h2>
        <motion.p
          className="mt-2 text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Explore plans that fit your trading strategy's unique ambitions.
        </motion.p>
      </div>
      
      {/* Billing toggle */}
      <motion.div
        className="flex rounded-full bg-muted p-1 overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="relative w-full">
          <div className="flex relative z-10">
            <button
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors relative z-10 w-1/2",
                billingCycle === "monthly" 
                  ? "text-black dark:text-white" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </button>
            <button
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors relative z-10 w-1/2",
                billingCycle === "annually" 
                  ? "text-black dark:text-white" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setBillingCycle("annually")}
            >
              Annually
            </button>
          </div>
          
          <motion.div 
            className="absolute top-0 bottom-0 z-0 rounded-full bg-white dark:bg-zinc-800"
            initial={{ x: 0, width: "50%" }}
            animate={{
              x: billingCycle === "monthly" ? 0 : "100%",
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.3
            }}
            style={{ width: "50%" }}
          />
        </div>
      </motion.div>
      
      {/* Pricing cards */}
      <div className="grid w-full gap-6 md:grid-cols-2">
        {/* Starter Plan - Free */}
        <motion.div 
          className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-shadow"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="relative">
            <h3 className="text-xl font-medium">Starter Plan</h3>
            <div className="absolute right-0 top-0 rounded-full bg-amber-400/20 px-2 py-1 text-xs font-medium text-amber-400">
              POPULAR
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Perfect for individual traders looking to automate their first strategies.
            </p>
          </div>
          
          <div className="mt-2">
            <span className="text-3xl font-bold">Free</span>
            <span className="text-muted-foreground"></span>
          </div>
          
          <ul className="mt-4 flex flex-col gap-3 text-sm">
            {[
              "Up to 3 wallet connections",
              "Basic automation triggers",
              "Standard execution speed",
              "Community support",
              "7-day history retention",
              "Basic analytics dashboard"
            ].map((item, index) => (
              <motion.li 
                key={index}
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.4 + (index * 0.05) }}
              >
                <span className="text-primary">•</span> {item}
              </motion.li>
            ))}
          </ul>
          
          <motion.div 
            className="mt-auto pt-6"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Button 
              className="w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
              variant="default"
            >
              Get started
            </Button>
          </motion.div>
        </motion.div>
        
        {/* Pro Plan - $50 (discounted from $100) */}
        <motion.div 
          className="flex h-full flex-col gap-4 rounded-xl bg-black p-6 hover:shadow-lg transition-shadow dark:bg-zinc-900 text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div>
            <h3 className="text-xl font-medium">Pro Plan</h3>
            <p className="mt-2 text-sm text-gray-300 dark:text-gray-400">
              Ideal for active traders needing advanced automation and priority execution.
            </p>
          </div>
          
          <div className="mt-2 flex flex-col">
            <div className="flex items-baseline gap-2">
              <motion.span 
                key={billingCycle}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="text-3xl font-bold"
              >
                ${getPrice("50", "400")}
              </motion.span>
              <span className="text-gray-300 dark:text-gray-400">
                {billingCycle === "monthly" ? "/mo" : "/yr"}
              </span>
              <motion.span 
                key={`strike-${billingCycle}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-sm line-through text-gray-400 dark:text-gray-500"
              >
                ${getPrice("100", "500")}
              </motion.span>
            </div>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ 
                opacity: billingCycle === "annually" ? 1 : 0,
                height: billingCycle === "annually" ? "auto" : 0
              }}
              transition={{ duration: 0.3 }}
            >
              {billingCycle === "annually" && (
                <p className="mt-1 text-sm text-emerald-400 dark:text-emerald-300">
                  Save $100 with annual billing
                </p>
              )}
            </motion.div>
          </div>
          
          <ul className="mt-4 flex flex-col gap-3 text-sm text-gray-200 dark:text-gray-300">
            {[
              "Unlimited wallets",
              "Advanced triggers + conditions",
              "Priority execution",
              "AI model suggestions",
              "30-day history retention",
              "Advanced analytics + reporting",
              "Priority support",
              "Custom webhook integrations"
            ].map((item, index) => (
              <motion.li 
                key={index}
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.5 + (index * 0.05) }}
              >
                <span className="text-primary">•</span> {item}
              </motion.li>
            ))}
          </ul>
          
          <motion.div 
            className="mt-auto pt-6"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Button 
              className="w-full bg-white text-black hover:bg-white/90"
              variant="default"
            >
              Get started
            </Button>
          </motion.div>
        </motion.div>
      </div>
      
      <motion.p
        className="mt-4 text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        Pricing may vary depending on your usage requirements and customizations.
      </motion.p>
    </section>
  );
}