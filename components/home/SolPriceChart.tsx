"use client";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock data for SOL price
const generateMockData = () => {
  const data = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    
    // Generate a somewhat realistic price pattern
    const basePrice = 100 + Math.sin(i / 3) * 20;
    const randomFactor = 0.95 + Math.random() * 0.1; // Random factor between 0.95 and 1.05
    
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: +(basePrice * randomFactor).toFixed(2),
    });
  }
  return data;
};

export function SolPriceChart() {
  const [data, setData] = useState(generateMockData());
  const [priceChange, setPriceChange] = useState({ value: 0, percentage: 0 });
  
  useEffect(() => {
    // Calculate price change
    const firstPrice = data[0].price;
    const lastPrice = data[data.length - 1].price;
    const change = +(lastPrice - firstPrice).toFixed(2);
    const percentage = +((change / firstPrice) * 100).toFixed(2);
    
    setPriceChange({ value: change, percentage });
  }, [data]);
  
  const isPositive = priceChange.value >= 0;
  
  return (
    <div className="h-full">
      <div className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">SOL Price</h3>
              <Badge variant={isPositive ? "success" : "destructive"} className="h-5">
                {isPositive ? 'Bullish' : 'Bearish'}
              </Badge>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-2xl font-bold">${data[data.length - 1].price}</span>
              <div className={`flex items-center ml-2 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                {isPositive ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                <span className="text-sm font-medium">
                  {isPositive ? '+' : ''}{priceChange.value} ({isPositive ? '+' : ''}{priceChange.percentage}%)
                </span>
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground px-2 py-1 rounded-md">
            Last 30 days
          </div>
        </div>
      </div>
      
      <div className="h-[250px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11 }} 
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={['auto', 'auto']} 
              tick={{ fontSize: 11 }} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
              width={40}
            />
            <Tooltip 
              formatter={(value) => [`$${value}`, 'Price']}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{ 
                backgroundColor: 'rgba(22, 22, 22, 0.9)', 
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
              cursor={{ stroke: '#10B981', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
              activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}