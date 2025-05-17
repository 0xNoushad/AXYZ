"use client";

import { cn } from "@/lib/utils";
import { LoaderIcon, LoaderCircleIcon, type LucideProps } from 'lucide-react';

export type SpinnerProps = LucideProps & {
  variant?: 'default' | 'circle';
};

interface LoaderProps {
  size?: "sm" | "md" | "lg" | number;
  className?: string;
  color?: string;
  variant?: 'default' | 'circle';
}

export function Loader({ 
  size = "md", 
  className,
  color,
  variant = 'default'
}: LoaderProps) {
  // Convert size for Lucide icons
  const iconSize = typeof size === 'number' 
    ? size 
    : {
        sm: 20,
        md: 32,
        lg: 48
      }[size] || 32;
  
  return (
    <div className="flex items-center justify-center">
      {variant === 'default' ? (
        <LoaderIcon 
          className={cn('animate-spin', className)} 
          size={iconSize} 
          color={color} 
        />
      ) : (
        <LoaderCircleIcon 
          className={cn('animate-spin', className)} 
          size={iconSize} 
          color={color} 
        />
      )}
    </div>
  );
}

// For backward compatibility
export const Spinner = Loader;