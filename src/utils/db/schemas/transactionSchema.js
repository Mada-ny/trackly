import { z } from 'zod';

export const transactionSchema = z.object({
  id: z.number().optional(),
  date: z.instanceof(Date, { message: "La date doit être valide" }),
  accountId: z.number({ required_error: "L'identifiant du compte est requis" }),
  categoryId: z.number({ required_error: "L'identifiant de la catégorie est requis" }),
  amount: z.number({ required_error: "Le montant est requis" }).refine(val => val !== 0, "Le montant ne peut pas être zéro"),
  description: z.string().optional().or(z.literal("")),
});