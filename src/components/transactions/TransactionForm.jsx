import { useAccounts, useCategories } from "@/utils/db/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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

export default function TransactionForm() {
    const accounts = useAccounts();
    const categories = useCategories();

    const getDefaultValues = () => ({
        amount: undefined,
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

        db.transactions.add({
            date: dateTime,
            accountId: data.accountId,
            categoryId: data.categoryId,
            amount: data.amount,
            description: data.description,
        });

        form.reset();

        toast.success("Transaction ajoutée avec succès.", {
            position: "bottom-right"
        })
    }

    return (
        <Card className="w-full sm:max-w-md">
            <CardHeader>
                <CardTitle>Nouvelle transaction</CardTitle>
                    <CardDescription>
                        Ajoutez une nouvelle transaction (dépense ou revenu) à votre compte.
                    </CardDescription>
            </CardHeader>
            <CardContent>
                <form id="transaction-form" onSubmit={form.handleSubmit(onSubmit)}>
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
                                        placeholder="Entrez la somme de la transaction"
                                        autoComplete="off"
                                        type="number"
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
                                        onValueChange={(value) => field.onChange(Number(value))}
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
                                        onValueChange={(value) => field.onChange(Number(value))}
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

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            {/* Date */}
                            <Controller
                                name="date"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="transaction-form-date">Date</FieldLabel>
                                        <DatePicker 
                                            id="transaction-form-date" 
                                            value={field.value} 
                                            onChange={field.onChange} 
                                        />
                                    </Field>
                                )}
                            />

                            {/* Heure */}
                            <Controller
                                name="time"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="transaction-form-time">Heure</FieldLabel>
                                        <Input 
                                            {...field}
                                            id="transaction-form-time" 
                                            type="time"
                                            step="60"
                                            className="bg-background appearance-none 
                                                [&::-webkit-calendar-picker-indicator]:hidden 
                                                [&::-webkit-calendar-picker-indicator]:appearance-none"
                                        />
                                    </Field>
                                )}
                            />

                            {(form.formState.errors.date || form.formState.errors.time) && (
                                <FieldError className="col-span-2" errors={[
                                    form.formState.errors.date,
                                    form.formState.errors.time
                                ].filter(Boolean)} />
                            )}

                            <p className="text-xs text-muted-foreground col-span-2">
                                Si l'heure n'est pas connue, entrez <strong>00:00</strong>.
                            </p>
                        </div>

                        {/* Montant */}
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
                                        Une courte description aide à mieux suivre vos dépenses.
                                    </FieldDescription>
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter>
                <Field orientation="horizontal">
                    <Button type="button" variant="outline" onClick={() => form.reset(getDefaultValues())}>
                        Réinitialiser
                    </Button>
                    <Button type="submit" className={"bg-norway-600"} form="transaction-form" disabled={!form.formState.isValid || form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                </Field>
            </CardFooter>
        </Card>
    )
}