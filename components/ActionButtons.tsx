"use client";
import { ThemeToggle } from "@/components/theme/theme-toggle";
 
import { ConnectionModal } from "./WalletConnector";

export const ActionButtons = () => {
  return (
    <section className="flex items-center justify-center gap-4">
      <ThemeToggle />
      <ConnectionModal />
       
     
     </section>
  );
};
