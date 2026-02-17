import { z } from 'zod';
import { isFuture } from 'date-fns';
import { buildDateTime } from '@/utils/date/buildDateTime';

export const transactionFormSchema = z.object({
    amount: z.coerce.number().min(1, "Le montant doit être supérieur à 0."),
    description: z.string().trim().min(5, "Veuillez préciser la dépense (ex: Burger, courses, taxi)."),
    date: z.date(),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Heure non valide."),
    accountId: z.string().min(1, "Vous devez sélectionner un compte."),
    categoryId: z.string().min(1, "Vous devez sélectionner une catégorie."),
}).superRefine((data, ctx) => {
    const dateTime = buildDateTime(data.date, data.time);
    if (isFuture(dateTime)) {
        ctx.addIssue({ 
            code: "custom", 
            path: ["time"],
            message: "La date et l'heure ne peuvent pas être dans le futur.", 
        });
    }
});
