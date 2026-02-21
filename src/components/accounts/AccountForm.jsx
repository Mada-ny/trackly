import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { accountSchema } from "@/utils/db/schemas/accountSchema";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { db } from "@/utils/db/schema";
import { toast } from "sonner";
import { useEffect } from "react";
import { useCurrency } from "@/utils/number/CurrencyProvider";

export default function AccountForm({ 
    account = null, 
    onSuccess 
}) {
    const isEdit = !!account;
    const { currency } = useCurrency();

    const form = useForm({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            name: "",
            initialBalance: 0,
        },
    });

    useEffect(() => {
        if (account) {
            form.reset({
                name: account.name,
                initialBalance: account.initialBalance,
            });
        }
    }, [account, form]);

    const onSubmit = async (data) => {
        try {
            if (isEdit) {
                await db.accounts.update(account.id, data);
                toast.success("Compte modifié avec succès");
            } else {
                await db.accounts.add(data);
                toast.success("Compte ajouté avec succès");
            }
            onSuccess?.();
        } catch (error) {
            if (error.name === "ConstraintError") {
                toast.error("Un compte avec ce nom existe déjà");
            } else {
                toast.error("Une erreur est survenue");
                console.error(error);
            }
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
                <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Nom du compte</FieldLabel>
                            <Input {...field} placeholder="Ex: Wave, Porte-monnaie..." />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <Controller
                    name="initialBalance"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Solde initial ({currency})</FieldLabel>
                            <Input 
                                {...field} 
                                type="number" 
                                inputMode="decimal"
                                onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
            </FieldGroup>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Enregistrement..." : isEdit ? "Enregistrer" : "Ajouter"}
                </Button>
            </div>
        </form>
    );
}
