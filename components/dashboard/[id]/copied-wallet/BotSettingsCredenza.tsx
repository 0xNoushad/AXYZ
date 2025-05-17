"use client";

import { useState, useEffect } from "react";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaClose,
} from "@/components/ui/credenza";
import { Button } from "@/components/ui/button";
import { BotSettingsForm } from "./BotSettingsForm";
import { toast } from "@/lib/use-toast";
import { BotSettings } from "@/lib/types"; // Corrected import path

interface BotSettingsCredenzaProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BotSettings; // Use the imported BotSettings interface
  onSaveSettings: (newSettings: BotSettings) => void;
  isSaving?: boolean;
}

/**
 * Credenza modal for configuring bot settings.
 *
 * @param isOpen - Whether the modal is open.
 * @param onClose - Handler to close the modal.
 * @param settings - The current bot settings object.
 * @param onSaveSettings - Handler to save the settings.
 * @param isSaving - Optional boolean to show loading state on the save button.
 */
export function BotSettingsCredenza({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  isSaving = false,
}: BotSettingsCredenzaProps) {
  const [localSettings, setLocalSettings] = useState<BotSettings>(settings);

  // Update local state when settings prop changes (e.g., on initial load or external save)
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSettingChange = (field: keyof BotSettings, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveClick = () => {
    onSaveSettings(localSettings);
  };

  return (
    <Credenza open={isOpen} onOpenChange={onClose}>
      <CredenzaContent className="flex flex-col justify-between gap-0 rounded-t-3xl border bg-background text-foreground md:max-w-[450px] md:rounded-3xl">
        <CredenzaHeader className="w-full !text-center text-xl font-semibold">
          <CredenzaTitle>Bot Settings</CredenzaTitle>
          <CredenzaDescription>Configure your copy trading bot parameters.</CredenzaDescription>
        </CredenzaHeader>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Render the BotSettingsForm inside the Credenza */}
          <BotSettingsForm
            settings={localSettings}
            onSettingChange={handleSettingChange}
          />
          {/* Note: Target Wallet Input is handled separately in the main CopyWallet component */}
        </div>

        <CredenzaFooter className="flex gap-2 p-4">
          <Button
            onClick={handleSaveClick}
            disabled={isSaving}
            className="w-full rounded-full font-semibold"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
          <CredenzaClose asChild>
            <Button variant="outline" className="w-full rounded-full font-semibold">Close</Button>
          </CredenzaClose>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}