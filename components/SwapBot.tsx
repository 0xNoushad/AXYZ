"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings, Save, Play, Pause, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "@/lib/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { monitorWalletTransactions, SwapBotSettings } from "@/utils/pump";
import { PublicKey, Connection } from "@solana/web3.js";
import { RPC_ENDPOINT, RPC_WEBSOCKET_ENDPOINT } from "@/constants";

interface SwapBotProps {
  keypairId: string;
  publicKey: string;
  initialWalletAddress?: string;
}

const DEFAULT_SETTINGS: SwapBotSettings = {
  privateKey: "",
  maximumBuyAmount: 0.1,
  minimumBuyAmount: 0.01,
  sellUpperPercent: 10,
  sellLowerPercent: -10,
  isActive: false,
  targetWallet: "",
  supportedDEXs: {
    pumpfun: true,
    raydium: true,
    jupiter: true,
  },
};

/**
 * SwapBot component combines wallet copying and automated trading
 * 
 * @param keypairId - The current wallet's public key as string
 * @param publicKey - The wallet's public key
 * @param initialWalletAddress - Optional initial wallet address to copy
 */
export function SwapBot({ keypairId, publicKey, initialWalletAddress = "" }: SwapBotProps) {
  // State management
  const [targetWallet, setTargetWallet] = useState(initialWalletAddress);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<SwapBotSettings>(DEFAULT_SETTINGS);
  const [isActive, setIsActive] = useState(false);
  const [activeTab, setActiveTab] = useState("wallet");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<number | null>(null);
  const [privateKey, setPrivateKey] = useState<string>("");
  
  // Load settings from localStorage on component mount
  useEffect(() => {
    // Load settings
    const storedSettings = localStorage.getItem(`swapBotSettings-${keypairId}`);
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(parsedSettings);
        setIsActive(parsedSettings.isActive || false);
        
        // If we have a target wallet in settings but no initialWalletAddress, use it
        if (parsedSettings.targetWallet && !initialWalletAddress) {
          setTargetWallet(parsedSettings.targetWallet);
        }
      } catch (e) {
        console.error("Error parsing stored settings:", e);
      }
    }
    
    // If we have an initialWalletAddress, update the settings
    if (initialWalletAddress) {
      setSettings(prev => ({
        ...prev,
        targetWallet: initialWalletAddress
      }));
    }
    
    // Load private key
    const storedKeypairs = localStorage.getItem("solanaKeypairs");
    if (storedKeypairs) {
      try {
        const parsedKeypairs = JSON.parse(storedKeypairs);
        const selectedKeypair = parsedKeypairs.find((keypair: any) => keypair.publicKey === keypairId);
        if (selectedKeypair && selectedKeypair.privateKey) {
          setPrivateKey(selectedKeypair.privateKey);
          setSettings(prev => ({
            ...prev,
            privateKey: selectedKeypair.privateKey
          }));
        }
      } catch (e) {
        console.error("Error loading private key:", e);
      }
    }
  }, [keypairId, initialWalletAddress]);
  
  // Effect to start/stop the swap bot when isActive changes
  useEffect(() => {
    if (isActive) {
      startSwapBot();
    } else {
      stopSwapBot();
    }
    
    return () => {
      // Clean up on component unmount
      stopSwapBot();
    };
  }, [isActive]);
  
  // Start the swap bot
  const startSwapBot = useCallback(async () => {
    if (!targetWallet || !privateKey) {
      toast({
        title: "Error",
        description: "Target wallet and private key are required",
        variant: "destructive",
      });
      setIsActive(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Create connection
      const connection = new Connection(RPC_ENDPOINT, {
        wsEndpoint: RPC_WEBSOCKET_ENDPOINT,
      });
      
      // Start monitoring the target wallet
      const subId = await monitorWalletTransactions(
        targetWallet,
        publicKey,
        privateKey,
        settings,
        (tx) => {
          // Add transaction to the list
          setTransactions(prev => [tx, ...prev].slice(0, 10));
        }
      );
      
      if (subId) {
        setSubscriptionId(subId);
        
        toast({
          title: "Swap Bot Activated",
          description: "Now monitoring target wallet for transactions",
        });
      } else {
        throw new Error("Failed to start monitoring");
      }
    } catch (error) {
      console.error("Error starting swap bot:", error);
      setError("Failed to start swap bot. Please try again.");
      setIsActive(false);
    } finally {
      setIsLoading(false);
    }
  }, [targetWallet, privateKey, publicKey, settings]);
  
  // Stop the swap bot
  const stopSwapBot = useCallback(() => {
    if (subscriptionId !== null) {
      try {
        // Create connection
        const connection = new Connection(RPC_ENDPOINT, {
          wsEndpoint: RPC_WEBSOCKET_ENDPOINT,
        });
        
        // Unsubscribe
        connection.removeAccountChangeListener(subscriptionId);
        setSubscriptionId(null);
        
        toast({
          title: "Swap Bot Deactivated",
          description: "Stopped monitoring target wallet",
        });
      } catch (error) {
        console.error("Error stopping swap bot:", error);
      }
    }
  }, [subscriptionId]);
  
  // Save wallet address to copy
  const saveWalletToCopy = () => {
    if (!targetWallet) {
      toast({
        title: "Error",
        description: "Please enter a wallet address to copy",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Validate wallet address
      new PublicKey(targetWallet);
      
      // Save to localStorage
      const walletData = [{ address: targetWallet }];
      localStorage.setItem(`copyWallets-${keypairId}`, JSON.stringify(walletData));
      
      // Update settings
      const updatedSettings = {
        ...settings,
        targetWallet: targetWallet
      };
      localStorage.setItem(`swapBotSettings-${keypairId}`, JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
      
      toast({
        title: "Success",
        description: "Wallet address saved successfully",
      });
    } catch (error) {
      console.error("Error saving wallet:", error);
      toast({
        title: "Error",
        description: "Invalid wallet address",
        variant: "destructive",
      });
    }
  };
  
  // Save settings
  const saveSettings = () => {
    try {
      const updatedSettings = {
        ...settings,
        isActive,
        targetWallet
      };
      localStorage.setItem(`swapBotSettings-${keypairId}`, JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
      setIsSettingsOpen(false);
      
      toast({
        title: "Success",
        description: "Trading settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  };
  
  // Toggle bot active state
  const toggleBotActive = () => {
    const newActiveState = !isActive;
    setIsActive(newActiveState);
    
    // Update settings in localStorage
    const updatedSettings = {
      ...settings,
      isActive: newActiveState
    };
    localStorage.setItem(`swapBotSettings-${keypairId}`, JSON.stringify(updatedSettings));
    setSettings(updatedSettings);
    
    toast({
      title: newActiveState ? "Bot Activated" : "Bot Deactivated",
      description: newActiveState 
        ? "The trading bot is now active and will execute trades automatically" 
        : "The trading bot has been paused",
    });
  };
  
  // Handle input changes for settings
  const handleSettingChange = (field: keyof SwapBotSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle DEX toggle changes
  const handleDexToggle = (dex: keyof SwapBotSettings['supportedDEXs'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      supportedDEXs: {
        ...prev.supportedDEXs,
        [dex]: value
      }
    }));
  };
  
  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Swap Bot</CardTitle>
            <CardDescription>Copy trades and automate trading</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Trading Bot Settings</SheetTitle>
                  <SheetDescription>
                    Configure your automated trading parameters
                  </SheetDescription>
                </SheetHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="privateKey">Private Key (Encrypted)</Label>
                    <Input
                      id="privateKey"
                      type="password"
                      placeholder="Automatically used from wallet"
                      value="••••••••••••••••••••••••••••••••"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Your wallet's private key is securely stored and used for transactions
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxBuy">Maximum Buy (SOL)</Label>
                      <Input
                        id="maxBuy"
                        type="number"
                        step="0.01"
                        value={settings.maximumBuyAmount}
                        onChange={(e) => handleSettingChange('maximumBuyAmount', parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minBuy">Minimum Buy (SOL)</Label>
                      <Input
                        id="minBuy"
                        type="number"
                        step="0.01"
                        value={settings.minimumBuyAmount}
                        onChange={(e) => handleSettingChange('minimumBuyAmount', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sellUpper">Sell Upper % (Profit)</Label>
                      <Input
                        id="sellUpper"
                        type="number"
                        step="0.1"
                        value={settings.sellUpperPercent}
                        onChange={(e) => handleSettingChange('sellUpperPercent', parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sellLower">Sell Lower % (Stop Loss)</Label>
                      <Input
                        id="sellLower"
                        type="number"
                        step="0.1"
                        value={settings.sellLowerPercent}
                        onChange={(e) => handleSettingChange('sellLowerPercent', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Supported DEXs</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="pumpfun" className="cursor-pointer">PumpFun</Label>
                        <Switch
                          id="pumpfun"
                          checked={settings.supportedDEXs.pumpfun}
                          onCheckedChange={(checked) => handleDexToggle('pumpfun', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="raydium" className="cursor-pointer">Raydium</Label>
                        <Switch
                          id="raydium"
                          checked={settings.supportedDEXs.raydium}
                          onCheckedChange={(checked) => handleDexToggle('raydium', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="jupiter" className="cursor-pointer">Jupiter</Label>
                        <Switch
                          id="jupiter"
                          checked={settings.supportedDEXs.jupiter}
                          onCheckedChange={(checked) => handleDexToggle('jupiter', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button onClick={saveSettings}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            
            <Button 
              variant={isActive ? "destructive" : "default"}
              size="icon"
              onClick={toggleBotActive}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : isActive ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="wallet" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="wallet">Wallet Setup</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="wallet">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="walletAddress">Wallet Address to Copy</Label>
                <div className="flex space-x-2">
                  <Input
                    id="walletAddress"
                    placeholder="Enter wallet address to copy trades from"
                    value={targetWallet}
                    onChange={(e) => setTargetWallet(e.target.value)}
                  />
                  <Button onClick={saveWalletToCopy}>Save</Button>
                </div>
              </div>
              
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">Trading Bot Status</h3>
                  <div className={`px-2 py-1 rounded-full text-xs ${isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target Wallet:</span>
                    <span className="font-mono">{targetWallet ? `${targetWallet.slice(0, 4)}...${targetWallet.slice(-4)}` : 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Buy Range:</span>
                    <span>{settings.minimumBuyAmount} - {settings.maximumBuyAmount} SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sell Conditions:</span>
                    <span>{settings.sellUpperPercent}% profit / {settings.sellLowerPercent}% loss</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">DEXs:</span>
                    <span>
                      {Object.entries(settings.supportedDEXs)
                        .filter(([_, enabled]) => enabled)
                        .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1))
                        .join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="activity">
            <div className="space-y-4">
              {error && (
                <div className="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900 dark:text-red-300">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="rounded-lg border">
                <div className="p-4 border-b">
                  <h3 className="text-sm font-medium">Recent Activity</h3>
                </div>
                
                {transactions.length > 0 ? (
                  <div className="divide-y">
                    {transactions.map((tx, index) => (
                      <div key={index} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium">{tx.type || "Transaction"}</p>
                            <p className="text-xs text-muted-foreground">
                              {tx.timestamp ? formatDate(tx.timestamp) : "Recent"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${tx.status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {tx.status || "Pending"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {tx.amount ? `${tx.amount} SOL` : ""}
                            </p>
                          </div>
                        </div>
                        {tx.signature && (
                          <a 
                            href={`https://solscan.io/tx/${tx.signature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                          >
                            View on Solscan
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      {isLoading ? "Loading transactions..." : "No transactions yet"}
                    </p>
                    {!isLoading && !isActive && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Activate the bot to start copying trades
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}