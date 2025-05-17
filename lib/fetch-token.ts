// lib/token-utils.ts

import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAccount } from "@solana/spl-token";
import { TokenInfo, SolAsset } from "@/lib/types";

/**
 * Fetches token metadata and balances for a wallet
 * @param connection - Solana RPC connection
 * @param walletPublicKey - Wallet public key
 * @returns Array of token information
 */
export async function fetchWalletTokens(
  connection: Connection,
  walletPublicKey: PublicKey
): Promise<TokenInfo[]> {
  try {
    // Get all token accounts owned by this wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPublicKey,
      { programId: TOKEN_PROGRAM_ID }
    );

    // Map the token accounts to TokenInfo objects
    const tokens: TokenInfo[] = await Promise.all(
      tokenAccounts.value.map(async (tokenAccount) => {
        const accountData = tokenAccount.account.data.parsed.info;
        const mint = new PublicKey(accountData.mint);
        const amount = Number(accountData.tokenAmount.uiAmount);
        const decimals = accountData.tokenAmount.decimals;

        // You may want to fetch additional token metadata from a token list or API
        // This is a simplified example
        return {
          name: accountData.mint.substring(0, 6), // Placeholder name
          symbol: accountData.mint.substring(0, 4), // Placeholder symbol
          mint: mint,
          amount: amount,
          decimals: decimals,
          logoURI: "/token-placeholder.png", // Placeholder logo
          tokenAccount: tokenAccount.pubkey.toString(),
          programId: TOKEN_PROGRAM_ID.toString(),
          balance: amount,
          usdValue: 0, // Would need price data to calculate
        };
      })
    );

    return tokens;
  } catch (error) {
    console.error("Error fetching wallet tokens:", error);
    return [];
  }
}

/**
 * Integrates the fetchWalletTokens function into your page component
 * To be used in the useEffect hook
 */
export async function loadWalletAndTokens(
  connection: Connection,
  walletPublicKey: PublicKey,
  setBalance: (balance: number) => void,
  setTokens: (tokens: TokenInfo[]) => void
) {
  try {
    // Get SOL balance
    const solBalance = await connection.getBalance(walletPublicKey);
    setBalance(solBalance / 1_000_000_000); // Convert lamports to SOL

    // Get token balances
    const tokens = await fetchWalletTokens(connection, walletPublicKey);
    setTokens(tokens);
  } catch (error) {
    console.error("Error loading wallet data:", error);
  }
}