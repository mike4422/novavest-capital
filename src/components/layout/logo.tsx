import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <Image 
        src="/logo.png" 
        alt="NovaVest Capital Logo" 
        width={44} 
        height={44} 
        className="rounded-xl"
        priority // Add this since the logo is usually above the fold
      />
      <div>
        <p className="text-base font-bold leading-none tracking-tight">NovaVest</p>
        <p className="text-xs uppercase tracking-[0.32em] text-teal-200/80">Capital</p>
      </div>
    </Link>
  );
}