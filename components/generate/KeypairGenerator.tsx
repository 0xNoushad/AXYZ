"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Check, Copy, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { generateKeypair } from "@/lib/keypair-utils";

/**
 * Interface for the keypair generation result
 */
interface GeneratedKeypair {
  name: string;
  publicKey: string;
  privateKey: string;
}

/**
 * KeypairGenerator component for creating and managing Solana keypairs
 * 
 * @param onKeypairGenerated - Callback function when a keypair is successfully generated
 * @param onCancel - Optional callback function when generation is cancelled
 * @returns JSX.Element
 */
export function KeypairGenerator({
  onKeypairGenerated,
  onCancel
}: {
  onKeypairGenerated: (name: string, publicKey: string) => void;
  onCancel?: () => void;
}) {
  const { toast } = useToast();
  const [step, setStep] = useState<"generate" | "review" | "success">("generate");
  const [keypairName, setKeypairName] = useState("");
  const [generatedKeypair, setGeneratedKeypair] = useState<GeneratedKeypair | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveToLocalStorage, setSaveToLocalStorage] = useState(true);
  const [downloadBackup, setDownloadBackup] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle keypair generation
   */
  const handleGenerateKeypair = useCallback(async () => {
    if (!keypairName.trim()) {
      setError("Please enter a name for your keypair");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Generate a new keypair using the utility function
      const keypair = generateKeypair();
      const publicKey = keypair.publicKey;
      const privateKey = keypair.secretKey.toString();

      // Store the generated keypair in component state
      setGeneratedKeypair({
        name: keypairName,
        publicKey: publicKey.toString(),
        privateKey
      });

      // Move to the review step
      setStep("review");
    } catch (err) {
      console.error("Failed to generate keypair:", err);
      setError("An error occurred while generating the keypair. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [keypairName]);

  /**
   * Handle keypair confirmation and storage
   */
  const handleConfirmKeypair = useCallback(() => {
    if (!generatedKeypair) return;

    try {
      // Save to localStorage if option is selected
      if (saveToLocalStorage) {
        // Implement localStorage storage directly here since the function is missing
        try {
          // Get existing keypairs
          const existingKeypairsJSON = localStorage.getItem("solanaKeypairs") || "[]";
          const existingKeypairs = JSON.parse(existingKeypairsJSON);
          
          // Create new keypair object
          const newKeypair = {
            id: Date.now(), // Use timestamp as ID
            name: generatedKeypair.name,
            publicKey: generatedKeypair.publicKey,
            privateKey: generatedKeypair.privateKey, // Store private key for transaction signing
            created: new Date().toISOString()
          };
          
          // Add to existing keypairs
          existingKeypairs.push(newKeypair);
          
          // Store back in localStorage
          localStorage.setItem("solanaKeypairs", JSON.stringify(existingKeypairs));
        } catch (error) {
          console.error("Failed to store keypair:", error);
          throw new Error("Failed to store keypair in local storage");
        }
      }

      // Download backup file if option is selected
      if (downloadBackup) {
        // Implement download functionality directly here since the function is missing
        // Create a backup object with sensitive information
        const backupData = {
          walletName: generatedKeypair.name,
          publicKey: generatedKeypair.publicKey,
          privateKey: generatedKeypair.privateKey,
          createdAt: new Date().toISOString(),
          note: "WARNING: Keep this file secure. Anyone with access to this private key can control your funds."
        };
        
        // Convert to a JSON string
        const jsonData = JSON.stringify(backupData, null, 2);
        
        // Create a Blob with the JSON data
        const blob = new Blob([jsonData], { type: 'application/json' });
        
        // Create a download link and trigger the download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${generatedKeypair.name.replace(/\s+/g, '-')}-solana-backup.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      // Notify parent component about successful generation
      onKeypairGenerated(generatedKeypair.name, generatedKeypair.publicKey);

      // Show success message
      toast({
        title: "Keypair generated successfully",
        description: `Your new keypair "${generatedKeypair.name}" has been created.`,
        duration: 5000,
      });

      // Move to success step
      setStep("success");
    } catch (err) {
      console.error("Failed to save keypair:", err);
      setError("An error occurred while saving the keypair. Please try again.");
    }
  }, [generatedKeypair, saveToLocalStorage, downloadBackup, onKeypairGenerated, toast]);

  /**
   * Copy text to clipboard
   */
  const copyToClipboard = useCallback((text: string, description: string) => {
    navigator.clipboard.writeText(text);
    
    toast({
      title: "Copied to clipboard",
      description,
      duration: 3000,
    });
  }, [toast]);

  /**
   * Reset the generator to create a new keypair
   */
  const handleReset = useCallback(() => {
    setKeypairName("");
    setGeneratedKeypair(null);
    setStep("generate");
    setError(null);
  }, []);

  /**
   * Handle cancellation
   */
  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      handleReset();
    }
  }, [onCancel, handleReset]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {step === "generate" && "Generate New Keypair"}
          {step === "review" && "Review Your Keypair"}
          {step === "success" && "Keypair Generated Successfully"}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === "generate" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keypair-name">Keypair Name</Label>
              <Input
                id="keypair-name"
                placeholder="Enter a name for this keypair"
                value={keypairName}
                onChange={(e) => setKeypairName(e.target.value)}
                disabled={isGenerating}
                autoFocus
              />
              <p className="text-sm text-muted-foreground">
                This name will be used to identify your keypair in the dashboard.
              </p>
            </div>
          </div>
        )}

        {step === "review" && generatedKeypair && (
          <div className="space-y-4">
            <div className="rounded-md bg-muted p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Name:</span>
                  <span>{generatedKeypair.name}</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Public Key:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => copyToClipboard(
                        generatedKeypair.publicKey,
                        "Public key copied to clipboard"
                      )}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      <span className="text-xs">Copy</span>
                    </Button>
                  </div>
                  <div className="bg-background rounded p-2 overflow-x-auto">
                    <code className="text-xs break-all">{generatedKeypair.publicKey}</code>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-destructive">Private Key (Secret):</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => copyToClipboard(
                        generatedKeypair.privateKey,
                        "Private key copied to clipboard. Keep it secure!"
                      )}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      <span className="text-xs">Copy</span>
                    </Button>
                  </div>
                  <div className="bg-background rounded p-2 overflow-x-auto">
                    <code className="text-xs break-all">{generatedKeypair.privateKey}</code>
                  </div>
                </div>
              </div>
            </div>
            
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Important Security Notice</AlertTitle>
              <AlertDescription className="text-amber-700">
                Your private key is the only way to access your funds. Never share it with anyone and keep a secure backup.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="save-local-storage" 
                  checked={saveToLocalStorage}
                  onCheckedChange={(checked) => setSaveToLocalStorage(checked as boolean)}
                />
                <Label htmlFor="save-local-storage" className="text-sm cursor-pointer">
                  Save keypair to browser storage
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="download-backup" 
                  checked={downloadBackup}
                  onCheckedChange={(checked) => setDownloadBackup(checked as boolean)}
                />
                <Label htmlFor="download-backup" className="text-sm cursor-pointer">
                  Download keypair backup file
                </Label>
              </div>
            </div>
          </div>
        )}
        
        {step === "success" && (
          <div className="text-center py-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Keypair Generated Successfully</h3>
            <p className="text-muted-foreground mb-4">
              Your keypair has been created and is ready to use.
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {step === "generate" && (
          <>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateKeypair} 
              disabled={!keypairName.trim() || isGenerating}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Keypair"
              )}
            </Button>
          </>
        )}
        
        {step === "review" && (
          <>
            <Button variant="outline" onClick={handleReset}>
              Start Over
            </Button>
            <Button 
              onClick={handleConfirmKeypair}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
            >
              Confirm & Save
            </Button>
          </>
        )}
        
        {step === "success" && (
          <>
            <Button variant="outline" onClick={handleCancel}>
              Close
            </Button>
            <Button 
              onClick={handleReset}
              variant="default"
            >
              Generate Another
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}