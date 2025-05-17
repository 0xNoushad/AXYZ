"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BotSettings } from "@/lib/types"; // Corrected import path

interface BotSettingsFormProps {
  settings: BotSettings; // Use the imported BotSettings interface
  onSettingChange: (field: keyof BotSettings, value: any) => void;
}

/**
 * Form component for configuring bot settings.
 *
 * @param settings - The current bot settings object.
 * @param onSettingChange - Handler for changes to individual setting fields.
 */
export function BotSettingsForm({ settings, onSettingChange }: BotSettingsFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Bot Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="max-buy-amount">Maximum Buy Amount (SOL)</Label>
          <Input
            id="max-buy-amount"
            type="number"
            step="0.01"
            placeholder="e.g., 0.1"
            value={settings.maximumBuyAmount}
            onChange={(e) => onSettingChange("maximumBuyAmount", parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="min-buy-amount">Minimum Buy Amount (SOL)</Label>
          <Input
            id="min-buy-amount"
            type="number"
            step="0.01"
            placeholder="e.g., 0.01"
            value={settings.minimumBuyAmount}
            onChange={(e) => onSettingChange("minimumBuyAmount", parseFloat(e.target.value) || 0)}
          />
        </div>
        {/* Add other setting inputs here */}
        <div className="space-y-2">
          <Label htmlFor="slippage-bps">Slippage Tolerance (bps)</Label>
          <Input
            id="slippage-bps"
            type="number"
            step="1"
            placeholder="e.g., 50 (for 0.5%)"
            value={settings.slippageBps}
            onChange={(e) => onSettingChange("slippageBps", parseInt(e.target.value) || 0)}
          />
        </div>
      </div>
    </div>
  );
}