"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings, Save, ExternalLink } from "lucide-react";
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
import { CopyWalletTokens } from "./copywalletTokens";
import { Activate } from "./activate";
import { PublicKey } from "@solana/web3.js";

interface CopyWalletProps {
  keypairId: string;
  initialWalletAddress?: string;
}

interface WalletSettings {
  privateKey: string;
  maximumBuyAmount: number;
  minimumBuyAmount: number;
  sellUpperPercent: number;
  sellLowerPercent: number;
  isActive: boolean;
  targetWallet: string;
  supportedDEXs: {
    pumpfun: boolean;
    raydium: boolean;
    jupiter: boolean;
  };
}

const DEFAULT_SETTINGS: WalletSettings = {
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
 * CopyWallet component allows users to set up a wallet address to copy trades from
 * and configure automated trading parameters
 * 
 * @param keypairId - The current wallet's public key as string
 * @param initialWalletAddress - Optional initial wallet address to copy
 */
export function CopyWallet({ keypairId, initialWalletAddress = "" }: CopyWalletProps) {
  const [targetWallet, setTargetWallet] = useState(initialWalletAddress);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<WalletSettings>(DEFAULT_SETTINGS);
  const [isActive, setIsActive] = useState(false);
  const [activeTab, setActiveTab] = useState("wallet");
  const [isValidAddress, setIsValidAddress] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const storedSettings = localStorage.getItem(`copyWalletSettings-${keypairId}`);
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(parsedSettings);
        setIsActive(parsedSettings.isActive || false);
        
        // If we have a target wallet in settings but no initialWalletAddress, use it
        if (parsedSettings.targetWallet && !initialWalletAddress) {
          setTargetWallet(parsedSettings.targetWallet);
          validateWalletAddress(parsedSettings.targetWallet);
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
      validateWalletAddress(initialWalletAddress);
    }
  }, [keypairId, initialWalletAddress]);

  // Validate wallet address
  const validateWalletAddress = (address: string) => {
    if (!address) {
      setIsValidAddress(false);
      return false;
    }
    
    try {
      new PublicKey(address);
      setIsValidAddress(true);
      return true;
    } catch (error) {
      setIsValidAddress(false);
      return false;
    }
  };

  // Handle input change for target wallet
  const handleTargetWalletChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTargetWallet(value);
    validateWalletAddress(value);
  };

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

    if (!isValidAddress) {
      toast({
        title: "Error",
        description: "Please enter a valid Solana wallet address",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save to localStorage
      const walletData = [{ address: targetWallet }];
      localStorage.setItem(`copyWallets-${keypairId}`, JSON.stringify(walletData));
      
      // Update settings
      const updatedSettings = {
        ...settings,
        targetWallet: targetWallet
      };
      localStorage.setItem(`copyWalletSettings-${keypairId}`, JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
      
      toast({
        title: "Success",
        description: "Wallet address saved successfully",
      });
    } catch (error) {
      console.error("Error saving wallet:", error);
      toast({
        title: "Error",
        description: "Failed to save wallet address",
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
      localStorage.setItem(`copyWalletSettings-${keypairId}`, JSON.stringify(updatedSettings));
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
  const handleToggleActive = (newActiveState: boolean) => {
    setIsActive(newActiveState);
    
    // Update settings in localStorage
    const updatedSettings = {
      ...settings,
      isActive: newActiveState
    };
    localStorage.setItem(`copyWalletSettings-${keypairId}`, JSON.stringify(updatedSettings));
    setSettings(updatedSettings);
  };

  // Handle input changes for settings
  const handleSettingChange = (field: keyof WalletSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle DEX toggle changes
  const handleDexToggle = (dex: keyof WalletSettings['supportedDEXs'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      supportedDEXs: {
        ...prev.supportedDEXs,
        [dex]: value
      }
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Copy Trading</CardTitle>
            <CardDescription>Copy trades from another wallet</CardDescription>
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
                  
                  <Button onClick={saveSettings} className="mt-4">
                    <Save className="h-4 w-4 mr-2" />
                    Save Wallet
                  </Button>
                  
                  <div className="rounded-lg border p-4 mt-4">
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
                    
                    <div className="mt-4">
                      <Activate 
                        isActive={isActive} 
                        onToggle={handleToggleActive}
                        isWalletValid={isValidAddress && !!targetWallet}
                      />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="wallet" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="wallet">Wallet Setup</TabsTrigger>
            <TabsTrigger value="tokens">Target Tokens</TabsTrigger>
          </TabsList>
          
          <TabsContent value="wallet" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="targetWallet">Target Wallet Address</Label>
                <div className="flex space-x-2">
                  <Input
                    id="targetWallet"
                    placeholder="Enter Solana wallet address to copy"
                    value={targetWallet}
                    onChange={handleTargetWalletChange}
                    className={isValidAddress || !targetWallet ? "" : "border-red-300"}
                  />
                  {targetWallet && isValidAddress && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => window.open(`https://solscan.io/account/${targetWallet}`, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {targetWallet && !isValidAddress && (
                  <p className="text-xs text-red-500 mt-1">Invalid Solana wallet address</p>
                )}
              </div>
              
              <Button 
                onClick={saveWalletToCopy} 
                disabled={!targetWallet || !isValidAddress}
                className="w-full"
              >
                <Save className="h-4