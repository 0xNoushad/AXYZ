"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function PremiumPage() {
  const features = [
    "Access to all trading strategies",
    "Real-time trade notifications",
    "Advanced analytics dashboard",
    "Priority customer support",
    "Early access to new features",
    "Unlimited wallet tracking",
    "Custom strategy creation",
    "API access"
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Premium</h1>
        <p className="mt-2 text-muted-foreground">
          Upgrade to AXYZ Premium for advanced features and capabilities
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-lg border bg-card p-8 shadow-sm"
      >
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-px">
            <div className="rounded-lg bg-background p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">AXYZ Premium</h2>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$49</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Billed monthly. Cancel anytime.
                </p>
                <Button className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700">
                  Upgrade Now
                </Button>
              </div>
              
              <div className="mt-8">
                <h3 className="font-medium">Premium Features</h3>
                <ul className="mt-4 space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-2 mt-0.5 rounded-full bg-green-100 p-0.5 dark:bg-green-900">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-300" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Have questions about Premium? <a href="#" className="text-blue-600 hover:underline dark:text-blue-400">Contact support</a>
            </p>
          </div>
          
          <div className="mt-8 rounded-lg border p-6">
            <h3 className="font-medium">Compare Plans</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left">Feature</th>
                    <th className="pb-2 text-center">Free</th>
                    <th className="pb-2 text-center">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Wallet tracking</td>
                    <td className="py-2 text-center">3 wallets</td>
                    <td className="py-2 text-center">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Trading strategies</td>
                    <td className="py-2 text-center">Basic only</td>
                    <td className="py-2 text-center">All strategies</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Analytics</td>
                    <td className="py-2 text-center">Basic</td>
                    <td className="py-2 text-center">Advanced</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">API access</td>
                    <td className="py-2 text-center">❌</td>
                    <td className="py-2 text-center">✅</td>
                  </tr>
                  <tr>
                    <td className="py-2">Customer support</td>
                    <td className="py-2 text-center">Standard</td>
                    <td className="py-2 text-center">Priority</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-lg border bg-card p-6 shadow-sm"
      >
        <h2 className="text-xl font-bold">Frequently Asked Questions</h2>
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="font-medium">Can I cancel my subscription anytime?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Yes, you can cancel your subscription at any time. Your premium features will remain active until the end of your billing period.
            </p>
          </div>
          <div>
            <h3 className="font-medium">How do I get started with Premium?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Simply click the "Upgrade Now" button and follow the payment instructions. Your account will be upgraded instantly after payment is processed.
            </p>
          </div>
          <div>
            <h3 className="font-medium">Is there a free trial available?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              We offer a 7-day free trial for new users. You can try all premium features before committing to a subscription.
            </p>
          </div>
          <div>
            <h3 className="font-medium">What payment methods do you accept?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              We accept all major credit cards, PayPal, and cryptocurrency payments including SOL, BTC, and ETH.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}