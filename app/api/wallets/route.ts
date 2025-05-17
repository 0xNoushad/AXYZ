import { NextRequest, NextResponse } from 'next/server';
import { Keypair } from '@solana/web3.js'; // Keep for potential future use, but generation is client-side for now

// --- Types --- (Align with frontend KeypairData, but without private key info)
interface WalletMetadata {
  id: string; // Using public key as ID for simplicity
  name: string;
  publicKey: string;
  created: string;
  // Balance fetching would likely happen client-side or via a separate endpoint
}

// --- In-memory Store (Replace with database in production) ---
// IMPORTANT: This is for demonstration ONLY. Data is lost on server restart.
// Authentication/User scoping is also missing.
let wallets: WalletMetadata[] = [];

// --- Helper Functions ---
const findWalletIndex = (publicKey: string) => wallets.findIndex(w => w.publicKey === publicKey);

/**
 * @description GET handler to fetch all wallet metadata.
 * In a real app, this would be scoped to the authenticated user.
 * @param {NextRequest} request - The incoming request.
 * @returns {NextResponse} - JSON response with wallet data or error.
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    // For now, return all wallets
    return NextResponse.json(wallets);
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return NextResponse.json({ error: { message: 'Failed to fetch wallets', code: 'GET_WALLETS_FAILED' } }, { status: 500 });
  }
}

/**
 * @description POST handler to add new wallet metadata.
 * Receives name and publicKey from the client after client-side generation.
 * @param {NextRequest} request - The incoming request.
 * @returns {NextResponse} - JSON response with the created wallet data or error.
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    const body = await request.json();
    const { name, publicKey } = body;

    if (!name || !publicKey) {
      return NextResponse.json({ error: { message: 'Missing name or publicKey', code: 'INVALID_INPUT' } }, { status: 400 });
    }

    if (findWalletIndex(publicKey) !== -1) {
       return NextResponse.json({ error: { message: 'Wallet with this public key already exists', code: 'WALLET_EXISTS' } }, { status: 409 });
    }

    const newWallet: WalletMetadata = {
      id: publicKey, // Use publicKey as the unique ID
      name,
      publicKey,
      created: new Date().toISOString(),
    };

    wallets.push(newWallet);

    return NextResponse.json(newWallet, { status: 201 });

  } catch (error) {
    console.error("Error adding wallet:", error);
    // Check for specific error types if needed
    return NextResponse.json({ error: { message: 'Failed to add wallet', code: 'POST_WALLET_FAILED' } }, { status: 500 });
  }
}

/**
 * @description DELETE handler to remove wallet metadata.
 * Uses publicKey passed as a query parameter.
 * @param {NextRequest} request - The incoming request.
 * @returns {NextResponse} - Success (204 No Content) or error response.
 */
export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const publicKey = searchParams.get('publicKey');

    if (!publicKey) {
        return NextResponse.json({ error: { message: 'Missing publicKey parameter', code: 'INVALID_INPUT' } }, { status: 400 });
    }

    try {
        // TODO: Add authentication check here - ensure user owns this wallet
        const walletIndex = findWalletIndex(publicKey);

        if (walletIndex === -1) {
            return NextResponse.json({ error: { message: 'Wallet not found', code: 'NOT_FOUND' } }, { status: 404 });
        }

        // Remove the wallet from the in-memory store
        wallets.splice(walletIndex, 1);

        // Respond with No Content on successful deletion
        return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error("Error deleting wallet:", error);
        return NextResponse.json({ error: { message: 'Failed to delete wallet', code: 'DELETE_WALLET_FAILED' } }, { status: 500 });
    }
}

// Note: PUT/PATCH for editing wallet names could be added similarly.