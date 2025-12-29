import { useAccounts, useCategories } from "@/utils/db/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DatePicker from "../date/DatePicker";
import { db } from "@/utils/db/schema";
import { isFuture } from "date-fns";

function buildDateTime(date, time) {
    const [h, m] = time.split(":");
    const result = new Date(date);
    result.setHours(+h, +m, 0, 0);
    return result;
}

const formSchema = z.object({
    amount: z.coerce.number().min(1, "Le montant doit être supérieur à 0."),
    description: z.string().trim().min(5, "Veuillez préciser la dépense (ex: Burger, courses, taxi)."),
    date: z.date(),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Heure non valide."),
    accountId: z.coerce.number().min(1, "Vous devez sélectionner un compte."),
    categoryId: z.coerce.number().min(1, "Vous devez sélectionner une catégorie."),
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

export default function TransactionForm({ onSuccess }) {
    const accounts = useAccounts();
    const categories = useCategories();

    const getDefaultValues = () => ({
        amount: '',
        description: "",
        date: new Date(),
        time: new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit"
        }).slice(0, 5),
        accountId: "",
        categoryId: "",
      });
    
    const form = useForm({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: getDefaultValues(),
    })

    function onSubmit(data) {
        const dateTime = buildDateTime(data.date, data.time);

        const category = categories.find(
            (c) => c.id === data.categoryId
        );

        if (!category) {
            toast.error("Catégorie invalide");
            return;
        }

        const signedAmount = category.type === 'income' 
            ? data.amount 
            : -data.amount;

        db.transactions.add({
            date: dateTime,
            accountId: data.accountId,
            categoryId: data.categoryId,
            amount: signedAmount,
            description: data.description,
        });

        form.reset(getDefaultValues());

        toast.success("Transaction ajoutée avec succès.", {
            position: "bottom-right"
        })

        onSuccess?.();
    }

    return (
        <div className="w-full p-4 bg-white">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold">
                    Nouvelle transaction
                </h2>
                <p className="text-sm text-muted-foreground">
                    Ajoutez une nouvelle transaction (dépense ou revenu) à votre compte.
                </p>
            </div>

            {/* Form */}
            <form
                id="transaction-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
            >
                <FieldGroup>
                    {/* Montant */}
                    <Controller
                        name="amount"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="transaction-form-title">
                                    Montant
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="transaction-form-title"
                                    aria-invalid={fieldState.invalid}
                                    className="placeholder:text-sm"
                                    placeholder="Entrez la somme de la transaction"
                                    autoComplete="off"
                                    type="number"
                                    inputMode="decimal"
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    {/* Catégorie */}
                    <Controller
                        name="categoryId"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="transaction-form-category">
                                    Catégorie
                                </FieldLabel>
                                <Select
                                    value={field.value ? field.value.toString() : ""}
                                    onValueChange={(value) =>
                                        field.onChange(Number(value))
                                    }
                                >
                                    <SelectTrigger id="transaction-form-category">
                                        <SelectValue placeholder="Choisissez une catégorie" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem
                                                key={category.id}
                                                value={category.id.toString()}
                                            >
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    {/* Compte */}
                    <Controller
                        name="accountId"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="transaction-form-account">
                                    Compte
                                </FieldLabel>
                                <Select
                                    value={field.value ? field.value.toString() : ""}
                                    onValueChange={(value) =>
                                        field.onChange(Number(value))
                                    }
                                >
                                    <SelectTrigger id="transaction-form-account">
                                        <SelectValue placeholder="Choisissez un compte" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {accounts.map((account) => (
                                            <SelectItem
                                                key={account.id}
                                                value={account.id.toString()}
                                            >
                                                {account.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <Controller
                            name="date"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="transaction-form-date">
                                        Date
                                    </FieldLabel>
                                    <DatePicker
                                        id="transaction-form-date"
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                </Field>
                            )}
                        />

                        <Controller
                            name="time"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="transaction-form-time">
                                        Heure
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="transaction-form-time"
                                        type="time"
                                        step="60"
                                        className="bg-background appearance-none
                                            [&::-webkit-calendar-picker-indicator]:hidden
                                            [&::-webkit-calendar-picker-indicator]:appearance-none
                                            text-sm"
                                    />
                                </Field>
                            )}
                        />

                        {(form.formState.errors.date ||
                            form.formState.errors.time) && (
                            <FieldError
                                className="col-span-2"
                                errors={[
                                    form.formState.errors.date,
                                    form.formState.errors.time,
                                ].filter(Boolean)}
                            />
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full col-span-2 text-muted-foreground"
                            onClick={() =>
                                form.setValue("time", "00:00", {
                                    shouldValidate: true,
                                })
                            }
                        >
                            Heure inconnue
                        </Button>
                    </div>

                    {/* Description */}
                    <Controller
                        name="description"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="transaction-form-description">
                                    Description
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="transaction-form-description"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Burger chez Paul..."
                                    autoComplete="off"
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                                <FieldDescription>
                                    Une courte description aide à mieux suivre vos
                                    dépenses.
                                </FieldDescription>
                            </Field>
                        )}
                    />
                </FieldGroup>
            </form>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset(getDefaultValues())}
                >
                    Réinitialiser
                </Button>

                <Button
                    type="submit"
                    form="transaction-form"
                    className="bg-norway-600"
                    disabled={
                        !form.formState.isValid ||
                        form.formState.isSubmitting
                    }
                >
                    {form.formState.isSubmitting
                        ? "Enregistrement..."
                        : "Enregistrer"}
                </Button>
            </div>
        </div>
    )
}