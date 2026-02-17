import { z } from 'zod';

export const transactionSchema = z.object({
  id: z.number().optional(),
  date: z.instanceof(Date),
  accountId: z.number(),
  categoryId: z.number(),
  amount: z.number().refine(val => val !== 0, "Le montant ne peut pas être zéro"),
  description: z.string().optional().or(z.literal("")),
});