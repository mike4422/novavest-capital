import { Bitcoin, CircleDollarSign, Coins, Gem, Landmark, ShieldCheck } from "lucide-react";

export const appConfig = {
  name: "NovaVest Capital",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  tagline: "Secure Crypto Investments With Daily Returns",
  supportEmail: "support@novavestcapital.com"
};

export const supportedNetworks = [
  { symbol: "USDT", network: "TRC20", name: "USDT TRC20", icon: CircleDollarSign },
  { symbol: "USDT", network: "BEP20", name: "USDT BEP20 / BNB Smart Chain", icon: Coins },
  { symbol: "USDT", network: "ERC20", name: "USDT ERC20", icon: Landmark },
  { symbol: "ETH", network: "ETH", name: "Ethereum", icon: Gem },
  { symbol: "BTC", network: "BTC", name: "Bitcoin", icon: Bitcoin }
];

export const featureHighlights = [
  "Encrypted custody workflow",
  "Admin-reviewed transactions",
  "Real-time analytics",
  "Referral commission engine",
  "AI-powered trading systems",
  "Global access and 24/7 support"
];

export const trustSignals = [
  { label: "Audited activity logs", icon: ShieldCheck },
  { label: "RLS protected database", icon: ShieldCheck },
  { label: "Role-based admin access", icon: ShieldCheck }
];
