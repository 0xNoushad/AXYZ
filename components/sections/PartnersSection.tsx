import Image from "next/image";

export function PartnersSection() {
  return (
    <section className="flex w-full max-w-4xl flex-col items-center gap-4">
      <p className="text-sm font-medium text-muted-foreground">build with</p>
      <div className="flex flex-wrap items-center justify-center gap-8">
        <div className="opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0">
          <Image src="/icons/helius.svg" alt="Solana" width={100} height={24} />
        </div>
        <div className="opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0">
          <Image src="/icons/solana.svg" alt="Jito" width={60} height={24} />
        </div>
     
        <div className="opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0">
          <Image src="/icons/helius.svg" alt="Backpack" width={90} height={24} />
        </div>
        <div className="opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0">
          <Image src="/icons/solana.svg" alt="Helius" width={80} height={24} />
        </div>
      </div>
    </section>
  );
}