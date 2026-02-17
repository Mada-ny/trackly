import { useAccounts } from "@/utils/db/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DatePicker from "../date/DatePicker";
import { buildDateTime } from "@/utils/date/buildDateTime";
import { db } from "@/utils/db/schema";
import { z } from "zod";
import { format } from "date-fns";

const transferFormSchema = z.object({
    amount: z.coerce.number({
        required_error: "Le montant est requis",
        invalid_type_error: "Le montant doit être un nombre",
    }).positive("Le montant doit être supérieur à 0"),
    fromAccountId: z.string().min(1, "Veuillez sélectionner le compte source"),
    toAccountId: z.string().min(1, "Veuillez sélectionner le compte destination"),
    date: z.date({
        required_error: "La date est requise",
        invalid_type_error: "Format de date invalide",
    }),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Format d'heure invalide (HH:mm)"),
}).refine(data => data.fromAccountId !== data.toAccountId, {
    message: "Les comptes source et destination doivent être différents",
    path: ["toAccountId"],
});

const getTransferDefaultValues = (overrides = {}) => ({
    amount: overrides.amount || "",
    fromAccountId: overrides.fromAccountId ? String(overrides.fromAccountId) : "",
    toAccountId: overrides.toAccountId ? String(overrides.toAccountId) : "",
    date: overrides.date || new Date(),
    time: overrides.time || new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    }).slice(0, 5),
});

export default function TransferForm({ 
    mode = "create",
    transferId = null,
    onSuccess, 
    defaultValues = {} 
}) {
    const accounts = useAccounts();
    const [isLoadingEdit, setIsLoadingEdit] = useState(mode === "edit");

    const form = useForm({
        resolver: zodResolver(transferFormSchema),
        mode: "onChange",
        defaultValues: getTransferDefaultValues(defaultValues),
    });

    useEffect(() => {
        if (mode === "edit" && transferId) {
            const loadTransfer = async () => {
                const linkedTransactions = await db.transactions.where("transferId").equals(transferId).toArray();
                if (linkedTransactions.length === 2) {
                    const fromT = linkedTransactions.find(t => t.amount < 0);
                    const toT = linkedTransactions.find(t => t.amount > 0);
                    
                    if (fromT && toT) {
                        form.reset({
                            amount: Math.abs(fromT.amount),
                            fromAccountId: String(fromT.accountId),
                            toAccountId: String(toT.accountId),
                            date: fromT.date,
                            time: format(fromT.date, "HH:mm"),
                        });
                    }
                }
                setIsLoadingEdit(false);
            };
            loadTransfer();
        }
    }, [mode, transferId, form]);

    useEffect(() => {
        if (mode === "create" && defaultValues.fromAccountId) {
            form.setValue("fromAccountId", String(defaultValues.fromAccountId));
        }
    }, [mode, defaultValues.fromAccountId, form]);

    const onSubmit = async (data) => {
        try {
            // 1. Ensure "Virement" category exists
            let category = await db.categories.where("name").equals("Transfert").first();
            if (!category) {
                const id = await db.categories.add({ name: "Transfert", type: "expense" });
                category = { id, name: "Transfert", type: "expense" };
            }

            const transferDate = buildDateTime(data.date, data.time);
            const fromAccount = accounts.find(a => String(a.id) === data.fromAccountId);
            const toAccount = accounts.find(a => String(a.id) === data.toAccountId);

            const tid = mode === "edit" ? transferId : crypto.randomUUID();

            await db.transaction("rw", db.transactions, async () => {
                if (mode === "edit") {
                    // Delete old ones to simplify update
                    await db.transactions.where("transferId").equals(transferId).delete();
                }

                // Create/Recreate both transactions
                await db.transactions.add({
                    date: transferDate,
                    accountId: Number(data.fromAccountId),
                    categoryId: category.id,
                    amount: -data.amount,
                    description: `Virement vers ${toAccount?.name}`,
                    transferId: tid,
                });

                await db.transactions.add({
                    date: transferDate,
                    accountId: Number(data.toAccountId),
                    categoryId: category.id,
                    amount: data.amount,
                    description: `Virement depuis ${fromAccount?.name}`,
                    transferId: tid,
                });
            });

            toast.success(mode === "create" ? "Virement effectué" : "Virement modifié");
            onSuccess?.();
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors du traitement.");
        }
    }

    const isLoading = !accounts.length || isLoadingEdit;

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="w-full p-4 bg-background pb-24">
            <p className="text-sm text-muted-foreground mb-6">
                Transférez de l'argent d'un compte à un autre en toute simplicité.
            </p>

            <form
                id="transfer-form"
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
                                <FieldLabel>Montant</FieldLabel>
                                <Input
                                    {...field}
                                    type="number"
                                    inputMode="decimal"
                                    placeholder="0.00"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    {/* Compte Source */}
                    <Controller
                        name="fromAccountId"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>De (Source)</FieldLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir le compte source" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.map(acc => (
                                            <SelectItem key={acc.id} value={String(acc.id)}>
                                                {acc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    {/* Compte Destination */}
                    <Controller
                        name="toAccountId"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>Vers (Destination)</FieldLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir le compte destination" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.map(acc => (
                                            <SelectItem key={acc.id} value={String(acc.id)}>
                                                {acc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    {/* Date & Heure */}
                    <div className="grid grid-cols-2 gap-4">
                        <Controller
                            name="date"
                            control={form.control}
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel>Date</FieldLabel>
                                    <DatePicker value={field.value} onChange={field.onChange} />
                                </Field>
                            )}
                        />
                        <Controller
                            name="time"
                            control={form.control}
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel>Heure</FieldLabel>
                                    <Input {...field} type="time" />
                                </Field>
                            )}
                        />
                    </div>
                </FieldGroup>
            </form>

            <div className="mt-6 flex items-center justify-end gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset(getTransferDefaultValues())}
                >
                    Réinitialiser
                </Button>
                <Button
                    type="submit"
                    form="transfer-form"
                    disabled={!form.formState.isValid || form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting ? "Traitement..." : mode === "create" ? "Effectuer le virement" : "Enregistrer"}
                </Button>
            </div>
        </div>
    );
}
