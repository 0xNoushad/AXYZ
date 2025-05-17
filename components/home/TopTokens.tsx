"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";

// Mock data for top tokens
const mockTokens = [
  { 
    id: 1, 
    name: "Bonk", 
    symbol: "BONK", 
    price: 0.00000242, 
    change: 12.5,
    volume: "42.3M",
    logo: "https://cryptologos.cc/logos/bonk-bonk-logo.png?v=026"
  },
  { 
    id: 2, 
    name: "Dogwifhat", 
    symbol: "WIF", 
    price: 2.84, 
    change: 8.2,
    volume: "38.1M",
    logo: "https://cryptologos.cc/logos/dogwifhat-wif-logo.png?v=026"
  },
  { 
    id: 3, 
    name: "Jito", 
    symbol: "JTO", 
    price: 3.12, 
    change: -2.3,
    volume: "29.7M",
    logo: "https://cryptologos.cc/logos/jito-jto-logo.png?v=026"
  },
  { 
    id: 4, 
    name: "Raydium", 
    symbol: "RAY", 
    price: 1.78, 
    change: 5.6,
    volume: "18.5M",
    logo: "https://cryptologos.cc/logos/raydium-ray-logo.png?v=026"
  },
  { 
    id: 5, 
    name: "Render", 
    symbol: "RNDR", 
    price: 7.45, 
    change: -1.2,
    volume: "15.2M",
    logo: "https://cryptologos.cc/logos/render-token-rndr-logo.png?v=026"
  },
];

export function TopTokens() {
  const [tokens, setTokens] = useState(mockTokens);
  
  return (
    <div className="h-full">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Top Tokens</h3>
      </div>
      
      <div className="grid grid-cols-12 text-xs text-muted-foreground py-2 border-b">
        <div className="col-span-5">Token</div>
        <div className="col-span-3 text-right">Price</div>
        <div className="col-span-2 text-right">Change</div>
        <div className="col-span-2 text-right">Volume</div>
      </div>
      
      <div className="mt-2">
        {tokens.map((token) => (
          <div 
            key={token.id}
            className="grid grid-cols-12 py-2 hover:bg-muted/30 rounded-md cursor-pointer"
          >
            <div className="col-span-5 flex items-center">
              <div className="w-6 h-6 mr-2 rounded-full overflow-hidden bg-background flex items-center justify-center">
                <img 
                  src={token.logo} 
                  alt={token.name} 
                  className="w-5 h-5 object-contain"
                  onError={(e) => {
                    // Fallback for broken images
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${token.symbol}&background=random`;
                  }}
                />
              </div>
              <div>
                <div className="font-medium">{token.name}</div>
                <div className="text-xs text-muted-foreground">{token.symbol}</div>
              </div>
            </div>
            <div className="col-span-3 text-right self-center">
              ${token.price < 0.01 ? token.price.toFixed(8) : token.price.toFixed(2)}
            </div>
            <div className={`col-span-2 text-right self-center flex items-center justify-end ${token.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {token.change >= 0 ? 
                <ArrowUp className="h-3 w-3 mr-1" /> : 
                <ArrowDown className="h-3 w-3 mr-1" />
              }
              {Math.abs(token.change)}%
            </div>
            <div className="col-span-2 text-right self-center">
              ${token.volume}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}