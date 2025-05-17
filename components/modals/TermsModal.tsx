"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsModal({ open, onOpenChange }: TermsModalProps) {
  // Format date consistently
  const formattedDate = `${new Date().getMonth() + 1}/${new Date().getDate()}/${new Date().getFullYear()}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Terms and Conditions</DialogTitle>
          <p className="text-sm text-muted-foreground">Last updated: {formattedDate}</p>
        </DialogHeader>
        
        <div className="space-y-4 text-sm text-muted-foreground">
          <section>
            <h2 className="mb-1 text-base font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing or using NIO's services, you agree to be bound by these Terms and Conditions, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-base font-semibold text-foreground">2. Use License</h2>
            <p>
              Permission is granted to temporarily use NIO's services for personal, non-commercial transactional purposes only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="ml-6 list-disc space-y-1">
              <li>modify or copy the materials;</li>
              <li>use the materials for any commercial purpose;</li>
              <li>attempt to decompile or reverse engineer any software contained in NIO's platform;</li>
              <li>remove any copyright or other proprietary notations from the materials;</li>
              <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-1 text-base font-semibold text-foreground">3. Disclaimer</h2>
            <p>
              The materials on NIO's platform are provided on an 'as is' basis. NIO makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-base font-semibold text-foreground">4. Limitations</h2>
            <p>
              In no event shall NIO or its suppliers be liable for any damages arising out of the use or inability to use NIO's services.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-base font-semibold text-foreground">5. Cryptocurrency Risks</h2>
            <p>
              You acknowledge that trading and investing in cryptocurrencies involves significant risk. Cryptocurrency prices are highly volatile and can fluctuate widely in short periods of time.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-base font-semibold text-foreground">6. No Investment Advice</h2>
            <p>
              NIO does not provide investment, tax, legal, or accounting advice. The platform and its content are not intended to provide, and should not be relied on for, investment, tax, legal, or accounting advice.
            </p>
          </section>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>I Agree</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}