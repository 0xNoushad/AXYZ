"use client";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function TopTradersPage() {
  const traders = [
    { id: 1, name: "Trader One", returns: "+42.5%", followers: 1245 },
    { id: 2, name: "Trader Two", returns: "+38.2%", followers: 987 },
    { id: 3, name: "Trader Three", returns: "+35.7%", followers: 756 },
    { id: 4, name: "Trader Four", returns: "+31.9%", followers: 612 },
    { id: 5, name: "Trader Five", returns: "+28.3%", followers: 543 },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Top Traders</h1>
        <p className="mt-2 text-muted-foreground">
          Follow and learn from the best performers on Solana
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="rounded-lg border">
          <div className="grid grid-cols-12 gap-4 border-b p-4 font-medium">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Trader</div>
            <div className="col-span-2">Returns</div>
            <div className="col-span-2">Followers</div>
            <div className="col-span-3"></div>
          </div>
          
          {traders.map((trader, index) => (
            <div key={trader.id} className="grid grid-cols-12 gap-4 border-b p-4 last:border-0">
              <div className="col-span-1 flex items-center">{index + 1}</div>
              <div className="col-span-4 flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{trader.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{trader.name}</span>
              </div>
              <div className="col-span-2 flex items-center text-green-500">{trader.returns}</div>
              <div className="col-span-2 flex items-center">{trader.followers}</div>
              <div className="col-span-3 flex items-center justify-end">
                <Button variant="outline" size="sm" className="mr-2">View</Button>
                <Button size="sm">Follow</Button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}