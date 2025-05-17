"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUp, ArrowDown } from "lucide-react";

// Mock data for visibility metrics
const generateVisibilityData = () => {
  const data = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    
    // Generate a somewhat realistic visibility pattern
    const baseValue = 75 + Math.sin(i / 5) * 15;
    const randomFactor = 0.97 + Math.random() * 0.06; // Random factor between 0.97 and 1.03
    
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: +(baseValue * randomFactor).toFixed(1),
    });
  }
  return data;
};

export function BrandVisibility() {
  const [data, setData] = useState(generateVisibilityData());
  const [changePercentage, setChangePercentage] = useState(0);
  
  useEffect(() => {
    // Calculate percentage change
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    const change = lastValue - firstValue;
    const percentage = +((change / firstValue) * 100).toFixed(1);
    
    setChangePercentage(percentage);
  }, [data]);
  
  const isPositive = changePercentage >= 0;
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-medium">Brand visibility</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Percentage of AI answers about Business credit cards that mention Nio
        </p>
      </div>
      
      <div className="flex flex-col space-y-4">
        <div className="flex items-baseline justify-between">
          <h4 className="text-base font-medium">Visibility score</h4>
          <div className="flex items-center">
            {isPositive ? (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center text-green-500"
              >
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{changePercentage}%</span>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center text-red-500"
              >
                <ArrowDown className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{changePercentage}%</span>
              </motion.div>
            )}
            <span className="text-sm text-muted-foreground ml-2">vs last week</span>
          </div>
        </div>
        
        <div className="flex items-center">
          <h2 className="text-3xl font-bold">Sol</h2>
        </div>
        
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={[50, 100]} 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={false}
                tickCount={5}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Visibility']}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={isPositive ? "#10B981" : "#EF4444"} 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}