/**
 * Shared utilities used by both token and transaction hooks
 */

// Format USD value with proper currency formatting
export function formatUSD(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }
  
  // Format time remaining for cache expiration
  export function formatTimeRemaining(ms: number): string {
    if (!ms) return "Expired"
    const seconds = Math.floor(ms / 1000)
    if (seconds < 60) return `${seconds}s`
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  }
  
  // Format date from timestamp
  export function formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })
  }
  
  // Create error message from different error types
  export function createErrorMessage(err: unknown): string {
    let errorMessage = "An error occurred";
    
    // Type guard for error with response property
    if (err && typeof err === 'object' && 'response' in err) {
      const errorObj = err as { response?: { status?: number } };
      if (errorObj.response?.status === 401 || errorObj.response?.status === 403) {
        errorMessage = "API authentication error. Please check your API keys.";
      } else if (errorObj.response?.status === 429) {
        errorMessage = "Rate limit exceeded. Please try again later.";
      } else if (errorObj.response?.status === 404) {
        errorMessage = "Resource not found. Please check your inputs.";
      } else if ((errorObj.response?.status ?? 0) >= 500) {
        errorMessage = "Server error. Please try again later.";
      }
    }
    
    // Type guard for error with message property
    if (err && typeof err === 'object' && 'message' in err) {
      const errorObj = err as { message?: string };
      if (errorObj.message) {
        if (errorObj.message.includes("timeout")) {
          errorMessage = "Request timed out. Network may be slow.";
        } else if (errorObj.message.includes("Failed to fetch")) {
          errorMessage = "Network connection error. Please check your internet.";
        } else if (errorObj.message.includes("HELIUS_API_KEY")) {
          errorMessage = "Missing Helius API key. Please add it to your environment.";
        } else if (errorObj.message.includes("Rate limit")) {
          errorMessage = "API rate limit reached. Please try again later.";
        } else {
          errorMessage = `Error: ${errorObj.message}`;
        }
      }
    }
    
    return errorMessage;
  }
  
  // Create cache key based on address and resource type
  export function createCacheKey(address: string, resourceType: 'tokens' | 'transactions'): string {
    return `${resourceType}_${address}`;
  }
  
  // Get data from local storage with expiration check
  export function getFromCache<T>(
    key: string, 
    expirationTimeMs = 5 * 60 * 1000
  ): { data: T | null; isCached: boolean; age: number; expiresIn: number } {
    try {
      const cachedItem = localStorage.getItem(key);
      
      if (!cachedItem) {
        return { data: null, isCached: false, age: 0, expiresIn: 0 };
      }
      
      const { data, timestamp } = JSON.parse(cachedItem);
      const now = Date.now();
      const age = now - timestamp;
      
      // Check if data is expired
      if (age > expirationTimeMs) {
        return { data: null, isCached: false, age, expiresIn: 0 };
      }
      
      // Calculate time remaining until expiration
      const expiresIn = Math.max(0, expirationTimeMs - age);
      
      return { data, isCached: true, age, expiresIn };
    } catch (error) {
      console.error("Error retrieving from cache:", error);
      return { data: null, isCached: false, age: 0, expiresIn: 0 };
    }
  }
  
  // Save data to local storage with timestamp
  export function saveToCache<T>(key: string, data: T): void {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now()
      };
      
      localStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error("Error saving to cache:", error);
    }
  }
  
  // Implement a retry mechanism with exponential backoff
  export async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries = 3
  ): Promise<T> {
    let retryCount = 0;
    
    while (true) {
      try {
        return await fn();
      } catch (err) {
        if (retryCount >= maxRetries) {
          throw err;
        }
        
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        console.log(`Retrying in ${delay/1000}s (attempt ${retryCount + 1}/${maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        retryCount++;
      }
    }
  }