import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Check } from "lucide-react";
import { accountSchema } from "@/utils/db/schemas/accountSchema";
import { db } from "@/utils/db/schema";
import { toast } from "sonner";
import { useEffect } from "react";
import { useCurrency } from "@/utils/number/CurrencyProvider";
import { GlyphPicker, SwatchPicker, KindPicker } from "@/components/ui/glyph-picker";
import { ACCOUNT_GLYPH_OPTIONS, ACCOUNT_KINDS } from "@/utils/ui/iconMap";

const fieldLabel = { font: '500 12px var(--sans)', color: 'var(--ink-muted)', margin: '0 2px 9px' };

const fieldInput = {
    width: '100%', boxSizing: 'border-box', height: 48, padding: '0 15px', borderRadius: 14,
    border: '1px solid var(--line)', background: 'var(--surface)', font: '550 15px var(--sans)', color: 'var(--ink)', outline: 'none',
};

const fieldError = { font: '500 12px var(--sans)', color: 'var(--clay)', margin: '7px 2px 0' };

export default function AccountForm({
    account = null,
    onSuccess,
    onCancel,
}) {
    const isEdit = !!account;
    const { currency, supportedCurrencies } = useCurrency();
    const currencySymbol = supportedCurrencies.find((c) => c.code === currency)?.symbol || currency;

    const form = useForm({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            name: "",
            initialBalance: 0,
            kind: ACCOUNT_KINDS[1],
            glyph: ACCOUNT_GLYPH_OPTIONS[0],
            color: "#3f6f63",
        },
    });

    useEffect(() => {
        if (account) {
            form.reset({
                name: account.name,
                initialBalance: account.initialBalance,
                kind: account.kind || ACCOUNT_KINDS[1],
                glyph: account.glyph || ACCOUNT_GLYPH_OPTIONS[0],
                color: account.color || "#3f6f63",
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

    const isValid = (form.watch("name") || "").trim().length > 0;

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                    <div>
                        <div style={fieldLabel}>Nom du compte</div>
                        <input {...field} placeholder="Ex: Wave, Porte-monnaie..." style={fieldInput} />
                        {fieldState.invalid && <div style={fieldError}>{fieldState.error.message}</div>}
                    </div>
                )}
            />

            <div style={{ height: 18 }} />
            <Controller
                name="kind"
                control={form.control}
                render={({ field }) => (
                    <div>
                        <div style={fieldLabel}>Type</div>
                        <KindPicker options={ACCOUNT_KINDS} value={field.value} onChange={field.onChange} color={form.watch("color")} />
                    </div>
                )}
            />

            <div style={{ height: 18 }} />
            <Controller
                name="initialBalance"
                control={form.control}
                render={({ field, fieldState }) => (
                    <div>
                        <div style={fieldLabel}>Solde initial</div>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                                value={field.value}
                                onChange={(e) => field.onChange(Number(e.target.value.replace(/[^0-9]/g, '')))}
                                onBlur={field.onBlur}
                                inputMode="numeric"
                                placeholder="0"
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
                        <GlyphPicker options={ACCOUNT_GLYPH_OPTIONS} value={field.value} onChange={field.onChange} color={form.watch("color")} />
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
