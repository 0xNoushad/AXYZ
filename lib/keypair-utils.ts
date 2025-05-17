// keypair-utils.ts - Secure keypair handling utilities

import { Keypair } from "@solana/web3.js";
import base58 from "bs58";

/**
 * Reconstructs a Solana keypair from a private key
 * @param privateKeyString Private key in base58, hex, or array format
 * @returns Solana Keypair
 */
export function reconstructKeypair(privateKeyString: string): Keypair {
  try {
    // Try to decode as base58
    let privateKeyBytes: Uint8Array;
    
    if (privateKeyString.startsWith("[") && privateKeyString.endsWith("]")) {
      // Handle array format
      privateKeyBytes = new Uint8Array(JSON.parse(privateKeyString));
    } else if (/^[0-9a-fA-F]+$/.test(privateKeyString) && privateKeyString.length === 64) {
      // Handle hex format
      privateKeyBytes = hexToUint8Array(privateKeyString);
    } else {
      // Default to base58 format
      privateKeyBytes = base58.decode(privateKeyString);
    }
    
    return Keypair.fromSecretKey(privateKeyBytes);
  } catch (error) {
    console.error("Error reconstructing keypair:", error);
    throw new Error("Invalid private key format");
  }
}

/**
 * Securely stores a keypair in localStorage with encryption
 * @param name Identifier for the keypair
 * @param keypair Solana Keypair to store
 * @param password Optional password for encryption
 */
export function securelyStoreKeypair(name: string, keypair: Keypair, password?: string): void {
  try {
    // Convert the secret key to a string representation
    const privateKey = base58.encode(keypair.secretKey);
    const publicKey = keypair.publicKey.toString();
    
    // Get existing keypairs from localStorage
    const existingKeypairsJson = localStorage.getItem("solanaKeypairs") || "[]";
    const existingKeypairs = JSON.parse(existingKeypairsJson);
    
    // Check if a keypair with this name already exists
    const existingIndex = existingKeypairs.findIndex((kp: any) => kp.name === name);
    
    // Create the keypair object
    const keypairObject = {
      name,
      publicKey,
      privateKey: password ? encryptPrivateKey(privateKey, password) : privateKey,
      isEncrypted: Boolean(password)
    };
    
    // Update or add the keypair
    if (existingIndex >= 0) {
      existingKeypairs[existingIndex] = keypairObject;
    } else {
      existingKeypairs.push(keypairObject);
    }
    
    // Save back to localStorage
    localStorage.setItem("solanaKeypairs", JSON.stringify(existingKeypairs));
  } catch (error) {
    console.error("Error storing keypair:", error);
    throw new Error("Failed to store keypair securely");
  }
}

/**
 * Retrieves a keypair from localStorage
 * @param name Identifier for the keypair
 * @param password Password for decryption if the keypair is encrypted
 * @returns Solana Keypair or null if not found
 */
export function retrieveKeypair(name: string, password?: string): Keypair | null {
  try {
    // Get keypairs from localStorage
    const keypairsJson = localStorage.getItem("solanaKeypairs");
    if (!keypairsJson) return null;
    
    const keypairs = JSON.parse(keypairsJson);
    const keypairData = keypairs.find((kp: any) => kp.name === name);
    
    if (!keypairData) return null;
    
    // Decrypt if necessary
    let privateKey = keypairData.privateKey;
    if (keypairData.isEncrypted) {
      if (!password) {
        throw new Error("Password required to decrypt this keypair");
      }
      privateKey = decryptPrivateKey(privateKey, password);
    }
    
    // Reconstruct the keypair
    return reconstructKeypair(privateKey);
  } catch (error) {
    console.error("Error retrieving keypair:", error);
    return null;
  }
}

/**
 * Placeholder for private key encryption
 * In production, implement proper encryption with a library like CryptoJS
 */
function encryptPrivateKey(privateKey: string, password: string): string {
  // This is a placeholder. In production, use proper encryption:
  // 1. Generate a salt
  // 2. Derive a key from the password using PBKDF2
  // 3. Encrypt the private key using AES or another algorithm
  // 4. Return salt + IV + ciphertext
  
  // Example of how to implement with CryptoJS:
  /*
  const salt = CryptoJS.lib.WordArray.random(128/8);
  const key = CryptoJS.PBKDF2(password, salt, { keySize: 256/32, iterations: 1000 });
  const iv = CryptoJS.lib.WordArray.random(128/8);
  
  const encrypted = CryptoJS.AES.encrypt(privateKey, key, { 
    iv: iv, 
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });
  
  return salt.toString() + iv.toString() + encrypted.toString();
  */
  
  // For this example, we just return a mock "encrypted" string
  return `encrypted:${privateKey}:${password}`;
}

/**
 * Placeholder for private key decryption
 * In production, implement proper decryption with a library like CryptoJS
 */
function decryptPrivateKey(encryptedKey: string, password: string): string {
  // This is a placeholder. In production, reverse the encryption process:
  // 1. Extract salt, IV, and ciphertext
  // 2. Derive the key using the same parameters
  // 3. Decrypt the ciphertext
  
  // Example of how to implement with CryptoJS:
  /*
  const saltSize = 128/8*2; // Size in hex chars
  const ivSize = 128/8*2; // Size in hex chars
  
  const salt = CryptoJS.enc.Hex.parse(encryptedKey.substr(0, saltSize));
  const iv = CryptoJS.enc.Hex.parse(encryptedKey.substr(saltSize, ivSize));
  const encrypted = encryptedKey.substring(saltSize + ivSize);
  
  const key = CryptoJS.PBKDF2(password, salt, { keySize: 256/32, iterations: 1000 });
  
  const decrypted = CryptoJS.AES.decrypt(encrypted, key, { 
    iv: iv, 
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });
  
  return decrypted.toString(CryptoJS.enc.Utf8);
  */
  
  // For this example, we just extract the original private key
  if (encryptedKey.startsWith('encrypted:')) {
    return encryptedKey.split(':')[1];
  }
  
  return encryptedKey;
}

/**
 * Convert hex string to Uint8Array
 * @param hexString Hex string (without 0x prefix)
 * @returns Uint8Array
 */
function hexToUint8Array(hexString: string): Uint8Array {
  if (hexString.length % 2 !== 0) {
    throw new Error('Invalid hex string length');
  }
  
  const arrayBuffer = new Uint8Array(hexString.length / 2);
  
  for (let i = 0; i < hexString.length; i += 2) {
    const byteValue = parseInt(hexString.substr(i, 2), 16);
    arrayBuffer[i/2] = byteValue;
  }
  
  return arrayBuffer;
}

/**
 * Generates a new random keypair
 * @returns Solana Keypair
 */
export function generateKeypair(): Keypair {
  return Keypair.generate();
}

/**
 * Exports a keypair in different formats
 * @param keypair Solana Keypair
 * @returns Object containing different format representations
 */
export function exportKeypair(keypair: Keypair): {
  publicKey: string;
  privateKeyBase58: string;
  privateKeyHex: string;
  privateKeyArray: number[];
} {
  const publicKey = keypair.publicKey.toString();
  const privateKeyBase58 = base58.encode(keypair.secretKey);
  
  // Convert to hex
  const privateKeyHex = Array.from(keypair.secretKey)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Convert to array
  const privateKeyArray = Array.from(keypair.secretKey);
  
  return {
    publicKey,
    privateKeyBase58,
    privateKeyHex,
    privateKeyArray
  };
}