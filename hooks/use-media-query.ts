"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook for responsive media queries
 * 
 * @param query CSS media query string
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // Create media query list
    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);
    
    // Define callback for changes
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Add event listener
    media.addEventListener("change", listener);
    
    // Clean up
    return () => {
      media.removeEventListener("change", listener);
    };
  }, [query]);
  
  return matches;
}