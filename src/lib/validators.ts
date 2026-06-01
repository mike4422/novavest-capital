import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  referralCode: z.string().optional().nullable(),
  selectedPlan: z.string().optional().nullable()
});

export const depositSchema = z.object({
  amount: z.number().positive(),
  asset: z.string().min(2),
  network: z.string().min(2),
  proofUrl: z.string().optional().nullable(),
  txHash: z.string().optional().nullable()
});

export const withdrawalSchema = z.object({
  amount: z.number().positive(),
  asset: z.string().min(2),
  network: z.string().min(2),
  walletAddress: z.string().min(12)
});
