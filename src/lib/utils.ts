import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string | null | undefined) {
  const numeric = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(numeric);
}

export function formatPercent(value: number | string | null | undefined) {
  return `${Number(value || 0).toFixed(2)}%`;
}

export function absoluteUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${base}${path}`;
}

export function generateReferralCode(email: string) {
  const prefix = email.split("@")[0].replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix || "NV"}${suffix}`;
}

export function planProgress(startDate?: string | null, endDate?: string | null) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

export function safeNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
