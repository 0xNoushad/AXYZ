"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw } from "lucide-react";
import { toast } from "@/lib/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ActivateProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
  isWalletValid: boolean;
}

/**
 * Activate component handles the activation/deactivation of the copy trading bot
 * 
 * @param isActive - Current active state of the bot
 * @param onToggle - Callback function to toggle the active state
 * @param isWalletValid - Whether the target wallet is valid
 */
export function Activate({ isActive, onToggle, isWalletValid }: ActivateProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleActivate = async () => {
    if (!isWalletValid) {
      toast({
        title: "Error",
        description: "Please set up a valid wallet address first",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate connection to blockchain
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onToggle(true);
      
      toast({
        title: "Success",
        description: "Copy trading bot activated successfully",
      });
    } catch (error) {
      console.error("Error activating bot:", error);
      toast({
        title: "Error",
        description: "Failed to activate copy trading bot",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeactivate = async () => {
    setIsLoading(true);
    
    try {
      // Simulate disconnection from blockchain
      await new Promise(resolve => setTimeout(resolve, 800));
      
      onToggle(false);
      
      toast({
        title: "Success",
        description: "Copy trading bot deactivated",
      });
    } catch (error) {
      console.error("Error deactivating bot:", error);
      toast({
        title: "Error",
        description: "Failed to deactivate copy trading bot",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isActive) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="destructive"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Pause className="h-4 w-4 mr-2" />
            )}
            Stop Copy Trading
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Copy Trading?</AlertDialogTitle>
            <AlertDialogDescription>
              This will stop the bot from monitoring the target wallet and executing trades. Any ongoing transactions will be completed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate}>
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
  
  return (
    <Button 
      variant="default"
      className="w-full"
      onClick={handleActivate}
      disabled={isLoading || !isWalletValid}
    >
      {isLoading ? (
        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Play className="h-4 w-4 mr-2" />
      )}
      Start Copy Trading
    </Button>
  );
}