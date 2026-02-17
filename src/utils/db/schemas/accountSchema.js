import { z } from 'zod';

export const accountSchema = z.object({
  id: z.number().optional(),
  name: z.string().nonempty(),
  initialBalance: z.number(),
});