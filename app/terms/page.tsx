"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function TermsAndConditions() {
  // Use client-side only rendering for the date to avoid hydration mismatch
  const [formattedDate, setFormattedDate] = useState<string>("");
  
  useEffect(() => {
    // Format date consistently on client side only
    const date = new Date();
    setFormattedDate(`${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`);
  }, []);

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Terms and Conditions</h1>
          {formattedDate && (
            <p className="text-muted-foreground">Last updated: {formattedDate}</p>
          )}
        </div>

        <div className="space-y-6 text-sm text-muted-foreground">
          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing or using NIO's services, you agree to be bound by these Terms and Conditions, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">2. Use License</h2>
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
            <h2 className="mb-2 text-xl font-semibold text-foreground">3. Disclaimer</h2>
            <p>
              The materials on NIO's platform are provided on an 'as is' basis. NIO makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">4. Limitations</h2>
            <p>
              In no event shall NIO or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use NIO's services, even if NIO or a NIO authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">5. Cryptocurrency Risks</h2>
            <p>
              You acknowledge that trading and investing in cryptocurrencies involves significant risk. Cryptocurrency prices are highly volatile and can fluctuate widely in short periods of time. You are solely responsible for determining whether any investment, strategy, or transaction is appropriate for you based on your personal investment objectives, financial circumstances, and risk tolerance.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">6. No Investment Advice</h2>
            <p>
              NIO does not provide investment, tax, legal, or accounting advice. The platform and its content are not intended to provide, and should not be relied on for, investment, tax, legal, or accounting advice.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">7. Modifications</h2>
            <p>
              NIO may revise these terms of service for its platform at any time without notice. By using this platform you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">8. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of the United States and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>
        </div>

        <div className="flex justify-center pt-6">
          <Link href="/">
            <Button variant="outline">Return to Home</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}