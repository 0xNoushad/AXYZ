"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Play, Pause } from "lucide-react";

interface BotActivationToggleProps {
  isActive: boolean;
  onToggle: (checked: boolean) => void;
  isActivating: boolean;
  isDeactivating: boolean;
  disabled?: boolean; // Add disabled prop
}

/**
 * Component for toggling the bot's active state.
 *
 * @param isActive - Boolean indicating if the bot is currently active.
 * @param onToggle - Handler for the switch toggle event.
 * @param isActivating - Boolean indicating if the bot is currently activating.
 * @param isDeactivating - Boolean indicating if the bot is currently deactivating.
 * @param disabled - Optional boolean to disable the switch.
 */
export function BotActivationToggle({
  isActive,
  onToggle,
  isActivating,
  isDeactivating,
  disabled = false, // Default to false
}: BotActivationToggleProps) {
  const isLoading = isActivating || isDeactivating;

  return (
    <div className="flex items-center justify-between space-x-2">
      <Label htmlFor="bot-active">
        <div className="flex items-center gap-2">
          {isLoading ? (
            <span className="animate-spin">⚙️</span> // Simple spinner
          ) : isActive ? (
            <Play className="h-4 w-4 text-green-500" />
          ) : (
            <Pause className="h-4 w-4 text-red-500" />
          )}
          <span>Bot Status: {isLoading ? (isActivating ? "Activating..." : "Deactivating...") : isActive ? "Active" : "Inactive"}</span>
        </div>
      </Label>
      <Switch
        id="bot-active"
        checked={isActive}
        onCheckedChange={onToggle}
        disabled={isLoading}
      />
    </div>
  );
}