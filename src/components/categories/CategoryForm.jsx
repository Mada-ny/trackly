import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { categorySchema } from "@/utils/db/schemas/categorySchema";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/utils/db/schema";
import { toast } from "sonner";
import { useEffect } from "react";

export default function CategoryForm({ 
    category = null, 
    onSuccess 
}) {
    const isEdit = !!category;

    const form = useForm({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            type: "expense",
            monthlyLimit: null,
        },
    });

    useEffect(() => {
        if (category) {
            form.reset({
                name: category.name,
                type: category.type,
                monthlyLimit: category.monthlyLimit ?? null,
            });
        }
    }, [category, form]);

    const onSubmit = async (data) => {
        try {
            if (isEdit) {
                await db.categories.update(category.id, data);
                toast.success("Catégorie modifiée");
            } else {
                await db.categories.add(data);
                toast.success("Catégorie ajoutée");
            }
            onSuccess?.();
        } catch (error) {
            if (error.name === "ConstraintError") {
                toast.error("Une catégorie avec ce nom existe déjà");
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
                            <FieldLabel>Nom de la catégorie</FieldLabel>
                            <Input {...field} placeholder="Ex: Restaurant, Salaire..." />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <Controller
                    name="type"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Type de flux</FieldLabel>
                            <Select 
                                value={field.value} 
                                onValueChange={field.onChange}
                                disabled={isEdit} // Bloquer le changement de type pour éviter les problèmes de logique
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner le type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="expense">Dépense (Sortie)</SelectItem>
                                    <SelectItem value="income">Revenu (Entrée)</SelectItem>
                                </SelectContent>
                            </Select>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                {form.getValues("type") === "expense" && (
                    <Controller
                        name="monthlyLimit"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>Limite mensuelle (Optionnel)</FieldLabel>
                                <Input 
                                    {...field} 
                                    type="number" 
                                    inputMode="decimal"
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                    placeholder="Ex: 50000"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                )}
            </FieldGroup>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Enregistrement..." : isEdit ? "Enregistrer" : "Ajouter"}
                </Button>
            </div>
        </form>
    );
}
