import { useAccounts, useCategories, useTransaction } from "@/utils/db/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useMemo } from "react";
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DatePicker from "../date/DatePicker";
import { buildDateTime } from "@/utils/date/buildDateTime";
import { db } from "@/utils/db/schema";
import { format } from "date-fns";
import { transactionFormSchema } from "@/utils/db/schemas/transactionFormSchema";

// Valeurs par défaut pour une nouvelle transaction
const getCreateDefaultValues = (overrides = {}) => ({
    amount: "",
    description: "",
    date: new Date(),
    time: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    }).slice(0, 5),
    accountId: overrides.accountId ? String(overrides.accountId) : "",
    categoryId: overrides.categoryId ? String(overrides.categoryId) : "",
});

export default function TransactionForm({ 
    mode = "create",
    transactionId = null,
    onSuccess,
    defaultValues = {}
}) {
    // Récupération de la transaction si on est en mode édition
    const idToFetch = useMemo(() => mode === "edit" ? Number(transactionId) : null, [mode, transactionId]);
    const existingTransaction = useTransaction(idToFetch);
    
    // Chargement des listes pour les selects
    const accounts = useAccounts();
    const categories = useCategories();

    const isLoading =
        (mode === "edit" && !existingTransaction) ||
        accounts.length === 0 ||
        categories.length === 0;

    // Détermination des valeurs du formulaire (soit edition, soit création avec overrides)
    // L'utilisation de useMemo ici combinée à la prop 'values' de useForm règle le bug des cascading renders.
    const formValues = useMemo(() => {
        if (mode === "edit" && existingTransaction && accounts.length > 0 && categories.length > 0) {
            return {
                amount: Math.abs(existingTransaction.amount),
                description: existingTransaction.description,
                categoryId: String(existingTransaction.categoryId),
                accountId: String(existingTransaction.accountId),
                date: new Date(existingTransaction.date),
                time: format(existingTransaction.date, "HH:mm"),
            };
        }
        // En mode création, on retourne les valeurs par défaut
        if (mode === "create") {
            return getCreateDefaultValues(defaultValues);
        }
        return undefined;
    }, [mode, existingTransaction, accounts, categories, defaultValues]);
    
    const form = useForm({
        resolver: zodResolver(transactionFormSchema),
        mode: "onChange",
        values: formValues, // Synchronisation automatique et sécurisée par RHF
        defaultValues: getCreateDefaultValues(defaultValues),
    });

    const onSubmit = async (data) => {
        const category = categories.find(
            (c) => String(c.id) === data.categoryId
        );

        if (!category) {
            toast.error("Catégorie invalide.");
            return;
        }

        const signedAmount = category.type === 'income' ? data.amount : -data.amount;

        const transactionData = {
            date: buildDateTime(data.date, data.time),
            accountId: Number(data.accountId),
            categoryId: Number(data.categoryId),
            amount: signedAmount,
            description: data.description,
        }

        try {
            if (mode === "create") {
                await db.transactions.add(transactionData);
                toast.success("Transaction ajoutée avec succès.");
            } else {
                await db.transactions.update(Number(transactionId), transactionData);
                toast.success("Transaction modifiée avec succès.");
            }
            onSuccess?.();
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'enregistrement.");
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center p-8 bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="w-full p-4 bg-background pb-24">
            <p className="text-sm text-muted-foreground mb-6">
                {mode === "create" 
                    ? "Ajoutez une nouvelle transaction (dépense ou revenu) à votre compte."
                    : "Modifiez les détails de votre transaction ci-dessous."
                }
            </p>

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
                                    type="number"
                                    inputMode="decimal"
                                    placeholder="0.00"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
                                    key={`cat-${field.value}`}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger id="transaction-form-category">
                                        <SelectValue placeholder="Choisissez une catégorie" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories
                                            .filter(c => c.name !== "Transfert" || String(c.id) === field.value)
                                            .map((category) => (
                                            <SelectItem
                                                key={category.id}
                                                value={String(category.id)}
                                            >
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
                                    key={`acc-${field.value}`}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger id="transaction-form-account">
                                        <SelectValue placeholder="Choisissez un compte" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.map((account) => (
                                            <SelectItem
                                                key={account.id}
                                                value={String(account.id)}
                                            >
                                                {account.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    {/* Date & Heure */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <Controller
                            name="date"
                            control={form.control}
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel htmlFor="transaction-form-date">Date</FieldLabel>
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
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel htmlFor="transaction-form-time">Heure</FieldLabel>
                                    <Input
                                        {...field}
                                        id="transaction-form-time"
                                        type="time"
                                        className="text-sm"
                                    />
                                </Field>
                            )}
                        />
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
                                    placeholder="Ex: Burger chez Paul..."
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                <FieldDescription>Aidez-vous à mieux suivre vos dépenses.</FieldDescription>
                            </Field>
                        )}
                    />
                </FieldGroup>
            </form>

            <div className="mt-6 flex items-center justify-end gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset(getCreateDefaultValues())}
                >
                    Réinitialiser
                </Button>
                <Button
                    type="submit"
                    form="transaction-form"
                    disabled={!form.formState.isValid || form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting ? "Enregistrement..." : mode === "create" ? "Ajouter" : "Enregistrer"}
                </Button>
            </div>
        </div>
    )
}
