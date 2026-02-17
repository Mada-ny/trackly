import { z } from 'zod';

export const accountSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Le nom du compte est requis"),
  initialBalance: z.number({
    required_error: "Le solde initial est requis",
    invalid_type_error: "Le solde doit être un nombre",
  }),
});