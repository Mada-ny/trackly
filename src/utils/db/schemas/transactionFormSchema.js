import { z } from 'zod';
import { isFuture } from 'date-fns';
import { buildDateTime } from '@/utils/date/buildDateTime';

export const transactionFormSchema = z.object({
    amount: z.coerce.number({
        required_error: "Le montant est requis",
        invalid_type_error: "Le montant doit être un nombre",
    }).min(1, "Le montant doit être supérieur à 0."),
    description: z.string().trim().min(5, "Veuillez préciser la dépense (au moins 5 caractères)."),
    date: z.date({
        required_error: "La date est requise",
        invalid_type_error: "Format de date invalide",
    }),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Format d'heure invalide (HH:mm)."),
    accountId: z.string().min(1, "Veuillez sélectionner un compte."),
    categoryId: z.string().min(1, "Veuillez sélectionner une catégorie."),
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
