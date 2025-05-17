'use client';
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TextScrambleRotateProps {
  texts: string[];
  className?: string;
  rotationInterval?: number;
  scrambleDuration?: number;
  scrambleSpeed?: number;
}

export function TextScrambleRotate({
  texts,
  className,
  rotationInterval = 3000,
  scrambleDuration = 0.5,
  scrambleSpeed = 0.05,
}: TextScrambleRotateProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState(texts[0]);
  const [isScrambling, setIsScrambling] = useState(false);
  
  const characterSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789🔐😏🚀🧠🌐🫆';
  
  const scrambleText = useCallback((targetText: string) => {
    setIsScrambling(true);
    
    const steps = scrambleDuration / scrambleSpeed;
    let step = 0;
    
    const interval = setInterval(() => {
      let scrambled = '';
      const progress = step / steps;
      
      for (let i = 0; i < targetText.length; i++) {
        if (targetText[i] === ' ') {
          scrambled += ' ';
          continue;
        }
        
        if (progress * targetText.length > i) {
          scrambled += targetText[i];
        } else {
          scrambled += characterSet[Math.floor(Math.random() * characterSet.length)];
        }
      }
      
      setDisplayText(scrambled);
      step++;
      
      if (step > steps) {
        clearInterval(interval);
        setDisplayText(targetText);
        setIsScrambling(false);
      }
    }, scrambleSpeed * 1000);
    
    return () => clearInterval(interval);
  }, [scrambleDuration, scrambleSpeed]);
  
  useEffect(() => {
    const rotationTimer = setInterval(() => {
      if (!isScrambling) {
        const nextIndex = (currentIndex + 1) % texts.length;
        setCurrentIndex(nextIndex);
        scrambleText(texts[nextIndex]);
      }
    }, rotationInterval);
    
    return () => clearInterval(rotationTimer);
  }, [currentIndex, isScrambling, rotationInterval, scrambleText, texts]);
  
  // Initial scramble
  useEffect(() => {
    scrambleText(texts[0]);
  }, [scrambleText, texts]);
  
  return (
    <motion.span layout className={className}>
      {displayText}
    </motion.span>
  );
}
