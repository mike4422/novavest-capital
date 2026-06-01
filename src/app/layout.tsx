import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { appConfig } from "@/lib/constants";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.url),
  title: {
    default: "NovaVest Capital | Premium Crypto Investment Platform",
    template: "%s | NovaVest Capital"
  },
  description: "A premium crypto investment and wealth management SaaS platform with secure deposits, investment tracking, withdrawals, referrals, and admin analytics.",
  keywords: ["crypto investment", "wealth management", "fintech", "investment dashboard", "NovaVest Capital"],
  openGraph: {
    title: "NovaVest Capital",
    description: "Secure Crypto Investments With Daily Returns",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
