
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { getCsrfToken, signIn as signInNextauth } from "next-auth/react";
import { SigninMessage } from "../SigninMessage";

export const signIn = async (
    ownerPublicKey: PublicKey,
    signMessage: (message: Uint8Array) => Promise<Uint8Array>,
): Promise<boolean> => {
    try {
        // Check if we're already authenticated to avoid unnecessary sign requests
        try {
            const currentSession = await fetch('/api/auth/session');
            const sessionData = await currentSession.json();
            
            if (sessionData?.user?.name === ownerPublicKey.toString()) {
                console.log("Already authenticated with this wallet");
                return true;
            }
        } catch (error) {
            console.warn("Failed to check session status:", error);
            // Continue with sign-in process even if session check fails
        }
        
        const csrf = await getCsrfToken();
        if (!ownerPublicKey || !csrf || !signMessage) {
            console.error("Missing required parameters for signIn.");
            return false;
        }

        const message = new SigninMessage({
            domain: window.location.host || "",
            publicKey: ownerPublicKey.toBase58(),
            statement: "Sign this message to log in to the app.\n",
            nonce: csrf,
        });

        const data = new TextEncoder().encode(message.prepare());
        
        console.log("Requesting signature from wallet...");
        const signature = await signMessage(data);
        const serializedSignature = bs58.encode(signature);

        console.log("Signature received, authenticating with server...");
        const response = await signInNextauth("signMessage", {
            message: JSON.stringify(message),
            signature: serializedSignature,
            redirect: false,
        });

        if (response?.error) {
            console.error("Error during sign-in:", response.error);
            return false;
        }
        
        console.log("Authentication successful");
        return true;
    } catch (error) {
        console.error("An error occurred during sign-in:", error);
        return false;
    }
};