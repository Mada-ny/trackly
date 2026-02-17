import { z } from 'zod';

export const categorySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Le nom de la catégorie est requis"),
  type: z.enum(['income', 'expense'], {
    error_Map: () => ({ message: "Le type de flux doit être soit 'Revenu' soit 'Dépense'" }),
  }),
  monthlyLimit: z.number({
    invalid_type_error: "La limite doit être un nombre",
  }).optional().nullable(),
});