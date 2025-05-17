## Project Rules: Solana Wallet Cloning Dashboard

### 1. Project Overview

This document outlines the rules for implementing the **app/dashboard/[id]** routes and **components/dashboard/[id]** in the Solana Wallet Cloning Dashboard, focusing on modular panel design, consistent conventions, and production‑grade guidelines.

### 2. Core Architecture

* **Framework**: Next.js (App Router) + TypeScript
* **State**: React Context API + custom hooks
* **Storage**: Encrypted IndexedDB (via `StorageAdapter`)
* **HTTP Layer**: Axios with interceptors (automatic retries, exponential backoff, timeout, auth, logging)
* **Blockchain SDKs**: Jupiter SDK (SPL token swaps) + Metaplex SDK (NFT queries & minting)
* **RPC Fallback**: Helius JSON‑RPC (primary) → Public Solana RPCs (secondary) based on daily quota

### 3. Dashboard Layout & Panels

1. **Keypair Management**

   * Bulk generation of ED25519 keypairs
   * Table: alias, public key, creation timestamp, SOL balance (via cached RPC)
   * Bulk actions: archive, encrypted export, delete, batch sync
   * Persistence: encrypted in IndexedDB with user passphrase (WebCrypto AES‑GCM)

2. **Source‑Wallet Configuration**

   * **Token Mirror**: display & select origin wallet’s SPL tokens + SOL (prices from Jupiter API)
   * **NFT Mirror**: infinite‑scroll gallery of Metaplex NFTs with metadata
   * Selective cloning: per‑token slippage, fee overrides; per‑NFT royalty & metadata tags

3. **Sync & Settings**

   * **Sync Now**: immediate push of selected assets to target keypair (atomic tx batching)
   * **Scheduler**: cron‑style (hourly, daily) + per‑keypair fee caps & priority bump settings
   * **Logs & Audit**: live feed of HTTP calls, RPC fallbacks, tx‑IDs, gas usage, errors

### 4. Code Organization

```bash
/app
  /dashboard
    page.tsx             # Overview
    /[id]
      page.tsx           # Keypair detail
      /tokens/page.tsx  # Token settings
      /nfts/page.tsx    # NFT settings
      /settings/page.tsx# Sync & settings
/components
  /Keypair
  /SourceWallet
  /Sync
  /Shared
/hooks
  useKeypairs.ts
  useTokens.ts
  useNFTs.ts
  useSync.ts
/lib
  /storage          # IndexedDB + encryption
  /api              # Axios clients & interceptors
  /blockchain       # Helius & fallback RPC utilities
  /crypto           # WebCrypto helpers
```

### 5. Naming Conventions

* **Files**: kebab-case (`keypair-list.tsx`)
* **Components**: PascalCase (`KeypairList`)
* **Hooks/Functions**: camelCase (`useSync`, `generateKeypair`)
* **Constants**: UPPER\_SNAKE\_CASE (`MAX_KEYPAIRS`)
* **Types/Interfaces**: PascalCase (`KeypairEntry`, `TokenConfig`)

### 6. State Management

* **Global**: separate React Contexts for keypairs, tokens, NFTs, sync settings
* **Local**: `useState`/`useReducer` for component state; memoize with `useCallback`/`useMemo`
* **Persistence**: context state saved to IndexedDB on change, rehydrated on load

### 7. API Integration & Caching

* **Axios Interceptors**:

  * Inject API keys / JWTs
  * Log request/response timings and errors
  * Retry failed calls (exponential backoff)
* **Quota Enforcement**:

  * Track Helius daily calls (max 1,000/day)
  * Auto-fallback to RPC fallbacks after quota reached
* **Caching**:

  * Token lists: TTL = 30 minutes
  * Price data: TTL = 5 minutes
  * Stale‑while‑revalidate: show cached data, refresh in background

### 8. Security Requirements

* **Private Keys**:

  * Never sent over network
  * Encrypted at rest (AES‑GCM) with user passphrase
  * Secure export: password‑protected JSON
* **Authentication**:

  * JWT or API key stored securely
  * Auto-refresh expired tokens
  * Secure logout and in-memory token purge

### 9. Performance Considerations

* **Virtualized Lists** for large keypair and NFT galleries
* **Code Splitting** & lazy loading for heavy components
* **Batch Operations**: group multiple swaps/mints into single tx when possible
* **Resource Throttling**: limit concurrent API calls to avoid rate limits

### 10. Testing & Quality

* **Unit Tests**: utilities, React hooks, API clients (≥ 80% coverage)
* **Integration Tests**: component interactions, mock RPC & price APIs
* **E2E Tests**: critical user flows (generation, config, sync) on testnet
* **Linting & Formatting**: ESLint + Prettier + TypeScript strict mode

### 11. Documentation

* **Code**: JSDoc comments for complex logic
* **User**: interactive guides for dashboard panels
* **Changelog**: maintain release notes with features & fixes

### 12. CI/CD & Deployment

* **CI**: GitHub Actions for linting, tests, bundle-size checks
* **Hosting**: Vercel with preview deployments for PRs
* **Monitoring**: application logs, Sentry for errors
* **Rollback**: Keep previous deployment ready for immediate rollback

### 13. Compliance & Legal

* Display disclaimers: "Use at your own risk"
* Comply with applicable financial regulations
* Audit third‑party licenses (Jupiter, Metaplex)
* Publish Privacy Policy & Terms of Service
