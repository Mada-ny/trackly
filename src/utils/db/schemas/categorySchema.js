import { z } from 'zod';

export const categorySchema = z.object({
  id: z.number().optional(),
  name: z.string().nonempty(),
  type: z.enum(['income', 'expense']),
  monthlyLimit: z.number().optional().nullable(),
});