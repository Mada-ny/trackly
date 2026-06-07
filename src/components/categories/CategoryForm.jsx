import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Check } from "lucide-react";
import { categorySchema } from "@/utils/db/schemas/categorySchema";
import { db } from "@/utils/db/schema";
import { toast } from "sonner";
import { useEffect } from "react";
import { useCurrency } from "@/utils/number/CurrencyProvider";
import { GlyphPicker, SwatchPicker } from "@/components/ui/glyph-picker";
import { CATEGORY_GLYPH_OPTIONS } from "@/utils/ui/iconMap";

const fieldLabel = { font: '500 12px var(--sans)', color: 'var(--ink-muted)', margin: '0 2px 9px' };

const fieldInput = {
    width: '100%', boxSizing: 'border-box', height: 48, padding: '0 15px', borderRadius: 14,
    border: '1px solid var(--line)', background: 'var(--surface)', font: '550 15px var(--sans)', color: 'var(--ink)', outline: 'none',
};

const fieldError = { font: '500 12px var(--sans)', color: 'var(--clay)', margin: '7px 2px 0' };

// Suffixe court affiché dans le champ "Plafond mensuel" (l'unité complète alourdirait le champ)
const SHORT_CURRENCY_SUFFIX = { XOF: "F", EUR: "€", USD: "$" };

const TYPE_OPTIONS = [
    { id: "expense", label: "Dépense", color: "var(--clay)" },
    { id: "income", label: "Revenu", color: "var(--pine)" },
];

function TypeSegment({ value, onChange, disabled }) {
    return (
        <div style={{ display: 'flex', gap: 4, background: 'rgba(60,52,38,0.05)', borderRadius: 14, padding: 4 }}>
            {TYPE_OPTIONS.map((o) => {
                const active = value === o.id;
                return (
                    <button
                        key={o.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(o.id)}
                        style={{
                            flex: 1, border: 'none', cursor: disabled ? 'default' : 'pointer', borderRadius: 11, padding: '10px 0',
                            font: '600 14px var(--sans)', color: active ? '#fff' : 'var(--ink-muted)',
                            background: active ? o.color : 'transparent', transition: 'all .15s',
                            opacity: disabled && !active ? 0.5 : 1,
                        }}
                    >{o.label}</button>
                );
            })}
        </div>
    );
}

export default function CategoryForm({
    category = null,
    onSuccess,
    onCancel,
}) {
    const isEdit = !!category;
    const { currency } = useCurrency();
    const currencySymbol = SHORT_CURRENCY_SUFFIX[currency] || currency;

    const form = useForm({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            type: "expense",
            monthlyLimit: null,
            glyph: CATEGORY_GLYPH_OPTIONS[0],
            color: "#b4623f",
        },
    });

    useEffect(() => {
        if (category) {
            form.reset({
                name: category.name,
                type: category.type,
                monthlyLimit: category.monthlyLimit ?? null,
                glyph: category.glyph || CATEGORY_GLYPH_OPTIONS[0],
                color: category.color || "#b4623f",
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

    const isValid = (form.watch("name") || "").trim().length > 0;

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                    <div>
                        <div style={fieldLabel}>Nom</div>
                        <input {...field} placeholder="Ex: Alimentation" style={fieldInput} />
                        {fieldState.invalid && <div style={fieldError}>{fieldState.error.message}</div>}
                    </div>
                )}
            />

            <div style={{ height: 18 }} />
            <Controller
                name="type"
                control={form.control}
                render={({ field }) => (
                    <div>
                        <div style={fieldLabel}>Type</div>
                        <TypeSegment value={field.value} onChange={field.onChange} disabled={isEdit} />
                    </div>
                )}
            />

            <div style={{ height: 18 }} />
            <Controller
                name="monthlyLimit"
                control={form.control}
                render={({ field, fieldState }) => (
                    <div>
                        <div style={fieldLabel}>Plafond mensuel (optionnel)</div>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                                value={field.value ?? ""}
                                onChange={(e) => {
                                    const digits = e.target.value.replace(/[^0-9]/g, '');
                                    field.onChange(digits ? Number(digits) : null);
                                }}
                                onBlur={field.onBlur}
                                inputMode="numeric"
                                placeholder="Aucune limite"
                                style={{ ...fieldInput, paddingRight: 38, fontVariantNumeric: 'tabular-nums' }}
                            />
                            <span style={{ position: 'absolute', right: 16, font: '600 15px var(--sans)', color: 'var(--ink-muted)' }}>{currencySymbol}</span>
                        </div>
                        {fieldState.invalid && <div style={fieldError}>{fieldState.error.message}</div>}
                    </div>
                )}
            />

            <div style={{ height: 18 }} />
            <Controller
                name="glyph"
                control={form.control}
                render={({ field }) => (
                    <div>
                        <div style={fieldLabel}>Icône</div>
                        <GlyphPicker options={CATEGORY_GLYPH_OPTIONS} value={field.value} onChange={field.onChange} color={form.watch("color")} />
                    </div>
                )}
            />

            <div style={{ height: 18 }} />
            <Controller
                name="color"
                control={form.control}
                render={({ field }) => (
                    <div>
                        <div style={fieldLabel}>Couleur</div>
                        <SwatchPicker value={field.value} onChange={field.onChange} />
                    </div>
                )}
            />

            <div style={{ display: 'flex', gap: 11, marginTop: 26 }}>
                {onCancel && (
                    <button type="button" onClick={onCancel} style={{
                        flex: 1, height: 52, borderRadius: 16, border: '1px solid var(--line)',
                        background: 'var(--surface)', color: 'var(--ink)', font: '600 15px var(--sans)', cursor: 'pointer',
                    }}>Annuler</button>
                )}
                <button type="submit" disabled={!isValid || form.formState.isSubmitting} style={{
                    flex: 2, height: 52, borderRadius: 16, border: 'none', cursor: isValid ? 'pointer' : 'default',
                    background: isValid ? 'var(--pine)' : 'rgba(60,52,38,0.1)', color: isValid ? '#fff' : 'var(--ink-muted)', font: '650 15px var(--sans)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: isValid ? '0 8px 20px rgba(44,84,72,0.26)' : 'none',
                }}>
                    <Check size={18} strokeWidth={2.2} />
                    {form.formState.isSubmitting ? "Enregistrement..." : isEdit ? "Enregistrer" : "Ajouter"}
                </button>
            </div>
        </form>
    );
}
