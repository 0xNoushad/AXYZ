"use client";

import { PublicKey } from "@solana/web3.js";
import { useState, useEffect, useCallback, FC } from "react"; // Import FC
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/use-toast";
import { Settings } from "lucide-react";
import { BotSettings, DEFAULT_SETTINGS } from "@/lib/types"; // Corrected import path
import { BotSettingsCredenza } from "./BotSettingsCredenza"; // Assuming you have a Credenza component for settings
import { SwapBot } from "./SwapBot"; // Assuming the SwapBot component handles the actual copy trading logic

interface CopyWalletProps {
  keypairId: string;
  publicKey: string; // Pass the user's wallet public key
  privateKey: string; // Pass the user's wallet private key
  initialWalletAddress?: string;
}

interface TargetWalletInputProps {
  targetWallet: string;
  onTargetWalletChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isValidAddress: boolean;
  onSave: () => void;
  isSaving: boolean;
}

interface BotActivationToggleProps {
  isActive: boolean;
  onToggle: (checked: boolean) => void;
  isActivating: boolean;
  isDeactivating: boolean;
  disabled: boolean;
}

/**
 * Component for setting up copy trading from a target wallet and configuring the bot.
 *
 * @param keypairId - The unique identifier for the user's keypair.
 * @param publicKey - The public key of the user's wallet.
 * @param privateKey - The private key of the user's wallet (used by SwapBot).
 * @param initialWalletAddress - Optional initial target wallet address.
 */
export function CopyWallet({ keypairId, publicKey, privateKey, initialWalletAddress = "" }: CopyWalletProps) {
  const [targetWallet, setTargetWallet] = useState(initialWalletAddress);
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [isSavingTargetWallet, setIsSavingTargetWallet] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [settings, setSettings] = useState<BotSettings>(DEFAULT_SETTINGS);
  // State for settings modal (you'll need to create this modal component)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);


  // Load settings and active state from localStorage on component mount
  useEffect(() => {
    // Load active state
    const storedIsActive = localStorage.getItem(`copyWalletIsActive-${keypairId}`);
    if (storedIsActive !== null) {
      setIsActive(storedIsActive === 'true');
    }

    // Load settings
    const storedSettings = localStorage.getItem(`copyWalletSettings-${keypairId}`);
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings }); // Merge with defaults
        // Also set the initial target wallet from settings if available
        if (parsedSettings.targetWallet) {
           setTargetWallet(parsedSettings.targetWallet);
           validateWalletAddress(parsedSettings.targetWallet); // Validate loaded address
        }
      } catch (e) {
        console.error("Error parsing stored copy wallet settings:", e);
        setSettings(DEFAULT_SETTINGS); // Fallback to defaults
      }
    } else {
       setSettings(DEFAULT_SETTINGS); // Use defaults if nothing stored
    }
  }, [keypairId]); // Added initialWalletAddress to dependency array - REMOVED, load from storage


  // Save active state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`copyWalletIsActive-${keypairId}`, isActive.toString());
  }, [isActive, keypairId]);

  // Validate wallet address
  const validateWalletAddress = useCallback((address: string) => {
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
  }, []);

  // Handle input change for target wallet
  const handleTargetWalletChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTargetWallet(value);
    validateWalletAddress(value);
  }, [validateWalletAddress]);

  // Save target wallet address and settings
  const saveTargetWallet = useCallback(() => {
     if (!targetWallet || !isValidAddress) {
       toast({
         title: "Error",
         description: "Please enter a valid target wallet address.",
         variant: "destructive",
       });
       return;
     }
     setIsSavingTargetWallet(true);
     try {
       // Always save the current targetWallet and settings together
       const updatedSettings = {
         ...settings, // Keep existing settings
         targetWallet: targetWallet, // Ensure targetWallet is saved in settings
       };
       localStorage.setItem(`copyWalletSettings-${keypairId}`, JSON.stringify(updatedSettings));
       setSettings(updatedSettings); // Update state with saved settings (including targetWallet)
       toast({
         title: "Success",
         description: "Target wallet address and settings saved.",
       });
     } catch (error) {
       console.error("Error saving target wallet and settings:", error);
       toast({
         title: "Error",
         description: "Failed to save target wallet address and settings",
         variant: "destructive",
       });
     } finally {
       setIsSavingTargetWallet(false);
     }
  }, [targetWallet, isValidAddress, settings, keypairId]);


  // Handle input changes for settings (This will now be used by the modal)
  const handleSettingChange = useCallback((field: keyof BotSettings, value: any) => {
    setSettings((prev: BotSettings) => ({ // Explicitly type prev as BotSettings
      ...prev,
      [field]: value
    }));
    // Settings are saved when the target wallet is saved, or via a separate settings save button in the modal
  }, []);

  // Handle bot activation (triggered by Switch)
  const handleToggleActive = useCallback(async (checked: boolean) => {
    if (checked) {
      // Attempt to activate
      if (!targetWallet || !isValidAddress) { // Fix: Replaced isTargetWalletSavedAndValid
        toast({
          title: "Error",
          description: "Please enter and save a valid target wallet address first",
          variant: "destructive",
        });
        // Revert the switch state if validation fails
        setIsActive(false);
        return;
      }
      setIsActivating(true);
      // The actual bot activation logic will be handled by the SwapBot component
      // based on the 'isActive' prop. We just update the state here.
      setIsActive(true);
      toast({
        title: "Activating Bot",
        description: "Attempting to start monitoring the target wallet...",
      });
      setIsActivating(false); // Assuming activation is quick or handled internally by SwapBot
    } else {
      // Attempt to deactivate
      setIsDeactivating(true);
      // The actual bot deactivation logic will be handled by the SwapBot component
      // based on the 'isActive' prop. We just update the state here.
      setIsActive(false);
      toast({
        title: "Deactivating Bot",
        description: "Stopping monitoring of the target wallet...",
      });
      setIsDeactivating(false); // Assuming deactivation is quick or handled internally by SwapBot
    }
  }, [targetWallet, isValidAddress]); // Fix: Dependency now checks targetWallet and isValidAddress

  // Removed duplicate handleSettingChange function here

  // Handle saving settings from the modal
  const handleSaveSettings = useCallback((newSettings: BotSettings) => {
    setIsSavingTargetWallet(true); // Reuse saving state for settings
    try {
      // Ensure targetWallet is included when saving settings
      const settingsToSave = {
        ...newSettings,
        targetWallet: targetWallet, // Include the current target wallet
      };
      localStorage.setItem(`copyWalletSettings-${keypairId}`, JSON.stringify(settingsToSave));
      setSettings(newSettings); // Update state with the new settings
      toast({
        title: "Success",
        description: "Bot settings saved.",
      });
      setIsSettingsModalOpen(false); // Close the modal on success
    } catch (error) {
      console.error("Error saving bot settings:", error);
      toast({
        title: "Error",
        description: "Failed to save bot settings",
        variant: "destructive",
      });
    } finally {
      setIsSavingTargetWallet(false);
    }
  }, [keypairId, targetWallet]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Copy Wallet & Bot</CardTitle>
        <CardDescription>
          Set a target wallet to copy trades from and configure automated trading.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Target Wallet Input Component */}
        <TargetWalletInput
          targetWallet={targetWallet}
          onTargetWalletChange={handleTargetWalletChange}
          isValidAddress={isValidAddress}
          onSave={saveTargetWallet}
          isSaving={isSavingTargetWallet}
        />

        {/* Bot Activation Toggle Component */}
        <BotActivationToggle
          isActive={isActive}
          onToggle={handleToggleActive}
          isActivating={isActivating}
          isDeactivating={isDeactivating}
          // Disable toggle if no valid address is set
          disabled={!targetWallet || !isValidAddress}
        />

        {/* Settings Button */}
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => setIsSettingsModalOpen(true)}
        >
          <Settings className="h-4 w-4" />
          Configure Bot Settings
        </Button>

        {/* Bot Settings Form Component */}
        {/* Removed direct rendering of BotSettingsForm */}
        {/* <BotSettingsForm
          settings={settings}
          onSettingChange={handleSettingChange}
        /> */}

        {/* Status Indicators (for debugging) */}
        <div className="text-sm text-muted-foreground">
          <p>Debug Status:</p>
          <p>Target Wallet Set: {!!targetWallet ? 'Yes' : 'No'}</p>
          <p>Address Valid: {isValidAddress ? 'Yes' : 'No'}</p>
          <p>Bot Active State: {isActive ? 'Yes' : 'No'}</p>
        </div>


        {/* Render the actual SwapBot component if active and conditions met */}
        {isActive && targetWallet && isValidAddress ? (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Bot Activity</h3>
             {/* The SwapBot component will handle the monitoring and trading */}
            <SwapBot
              keypairId={keypairId}
              publicKey={publicKey}
              privateKey={privateKey} // Ensure privateKey is passed
              initialWalletAddress={targetWallet} // Pass the target wallet to SwapBot
              isActive={isActive} // Fix: Pass isActive prop
              settings={settings} // Fix: Pass settings prop
            />
          </div>
        ) : (
           <div className="mt-6 text-center text-muted-foreground">
             {/* Message when bot is not active */}
             {!targetWallet || !isValidAddress ? (
               <p>Please enter and save a valid target wallet address to enable the bot.</p>
             ) : (
               <p>Toggle the switch above to start the copy trading bot.</p>
             )}
           </div>
        )}

      </CardContent>
      {/* Render the Settings Modal */}
      <BotSettingsCredenza
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        isSaving={isSavingTargetWallet} // Reuse saving state
      />
    </Card>
  );
}

// Helper component for Target Wallet Input
const TargetWalletInput: FC<TargetWalletInputProps> = ({ // Use FC and type props
  targetWallet,
  onTargetWalletChange,
  isValidAddress,
  onSave,
  isSaving,
}) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="targetWallet">Target Wallet Address</Label>
      <div className="flex gap-2">
        <Input
          id="targetWallet"
          placeholder="Enter wallet address to copy"
          value={targetWallet}
          onChange={onTargetWalletChange}
          className={targetWallet && !isValidAddress ? "border-red-500" : ""}
        />
        <Button onClick={onSave} disabled={!targetWallet || !isValidAddress || isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
      {targetWallet && !isValidAddress && (
        <p className="text-xs text-red-500">Invalid wallet address</p>
      )}
    </div>
  );
};

// Helper component for Bot Activation Toggle
const BotActivationToggle: FC<BotActivationToggleProps> = ({ // Use FC and type props
  isActive,
  onToggle,
  isActivating,
  isDeactivating,
  disabled,
}) => {
  const isLoading = isActivating || isDeactivating;
  const label = isActive ? "Bot Active" : "Bot Inactive";
  const description = isActive
    ? "The bot is monitoring the target wallet."
    : "Toggle to activate the copy trading bot.";

  return (
    <div className="flex items-center justify-between space-x-2">
      <div className="grid gap-1.5 leading-none">
        <Label
          htmlFor="bot-active"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch
        id="bot-active"
        checked={isActive}
        onCheckedChange={onToggle}
        disabled={isLoading || disabled}
        aria-label={label}
      />
    </div>
  );
};

// Assuming BotSettingsCredenza and SwapBot components exist and are imported correctly
// You will need to implement these components separately.