import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

export function FaqSection() {
  return (
    <section className="flex w-full max-w-5xl flex-col items-start gap-8 py-20 px-4">
      <div className="w-full mb-10">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-sm font-medium text-primary mb-2 block"
        >
          Frequently Asked Questions
        </motion.span>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold mb-6"
        >
          Your questions answered
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-muted-foreground max-w-2xl text-lg"
        >
          To provide flexible, powerful trading solutions that foster efficiency, security, and professional growth.
          We strive to create an environment where every trader can thrive.
        </motion.p>
      </div>
      
      <div className="w-full">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-b border-border/30 py-2">
            <div className="flex items-start">
              <span className="text-sm font-medium text-muted-foreground mr-4 mt-5">01</span>
              <AccordionTrigger className="text-xl font-medium py-4 hover:no-underline">
                How fast is AXYZ?
              </AccordionTrigger>
            </div>
            <AccordionContent className="text-muted-foreground pb-6 pl-10">
              We run on priority RPCs and Jito relayers, ensuring transaction speeds that can keep up with even the most sophisticated trading bots. Our architecture is optimized for minimal latency on the Solana blockchain.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2" className="border-b border-border/30 py-2">
            <div className="flex items-start">
              <span className="text-sm font-medium text-muted-foreground mr-4 mt-5">02</span>
              <AccordionTrigger className="text-xl font-medium py-4 hover:no-underline">
                Is my wallet at risk?
              </AccordionTrigger>
            </div>
            <AccordionContent className="text-muted-foreground pb-6 pl-10">
              Your security is our priority. No private keys are ever accessed or stored. We only listen to public blockchain activity and use secure connection methods that keep your assets safe at all times.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3" className="border-b border-border/30 py-2">
            <div className="flex items-start">
              <span className="text-sm font-medium text-muted-foreground mr-4 mt-5">03</span>
              <AccordionTrigger className="text-xl font-medium py-4 hover:no-underline">
                What chains are supported?
              </AccordionTrigger>
            </div>
            <AccordionContent className="text-muted-foreground pb-6 pl-10">
              We're 100% focused on Solana to provide the best possible trading experience. This specialization allows us to optimize for Solana's unique capabilities and deliver superior performance.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4" className="border-b border-border/30 py-2">
            <div className="flex items-start">
              <span className="text-sm font-medium text-muted-foreground mr-4 mt-5">04</span>
              <AccordionTrigger className="text-xl font-medium py-4 hover:no-underline">
                Can I run this on my own infrastructure?
              </AccordionTrigger>
            </div>
            <AccordionContent className="text-muted-foreground pb-6 pl-10">
              Yes, enterprise plans are available for organizations that require dedicated infrastructure. Contact our team for custom deployment options tailored to your specific needs.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}