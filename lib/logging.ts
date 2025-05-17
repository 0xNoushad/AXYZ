// Add this to utils.ts

/**
 * Utility for logging execution duration
 */
export function logDuration(label: string, start: number): void {
    console.log(`${label} took ${Date.now() - start}ms`);
  }
  
  // Example usage in getUserTokens():
  const startTime = Date.now();
  // ... perform operations
  const tokens = fetchTokensFromAPI();
  logDuration('Token fetch operation', startTime);

function fetchTokensFromAPI() {
    throw new Error("Function not implemented.");
}
