import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Wallet, ShoppingBag, Target, Repeat2, Sparkles, Bell, ArrowLeftRight, PiggyBank,
    ChevronRight, Pencil, Check,
} from "lucide-react";
import { GlyphChip } from "@/components/ui/glyph-chip";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAccounts, useCategories } from "@/utils/db/hooks";
import { useSettings, updateSetting } from "@/utils/db/hooks/useSettings";
import { useCurrency } from "@/utils/number/CurrencyProvider";
import { useTheme } from "@/components/ui/theme-provider";
import { hexA } from "@/utils/ui/colors";

const THEME_OPTIONS = [
    { value: "light", label: "Clair" },
    { value: "dark", label: "Sombre" },
    { value: "system", label: "Système" },
];

// ── Sub-components ────────────────────────────────────────────────────────

function SettingsRow({ icon, color, label, detail, badge, onClick }) {
    return (
        <button
            onClick={onClick}
            disabled={!onClick}
            style={{
                display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0', width: '100%',
                border: 'none', background: 'none', textAlign: 'left',
                cursor: onClick ? 'pointer' : 'default',
            }}
        >
            <GlyphChip icon={icon} color={color} size={36} radius={11} soft={0.14} />
            <span style={{ flex: 1, font: '550 15px var(--sans)', color: 'var(--ink)' }}>{label}</span>
            {detail && <span style={{ font: '480 13px var(--sans)', color: 'var(--ink-muted)' }}>{detail}</span>}
            {badge && (
                <span style={{
                    font: '600 10.5px var(--sans)', color: 'var(--pine)', background: hexA('#3f6f63', 0.1),
                    padding: '3px 8px', borderRadius: 99, letterSpacing: 0.2,
                }}>{badge}</span>
            )}
            {onClick && <ChevronRight size={16} strokeWidth={1.9} style={{ color: 'var(--ink-muted)' }} />}
        </button>
    );
}

function Group({ title, children }) {
    const items = Array.isArray(children) ? children.filter(Boolean) : [children];
    return (
        <div style={{ marginTop: 22 }}>
            <div style={{ font: '500 12px var(--sans)', color: 'var(--ink-muted)', margin: '0 6px 8px', letterSpacing: 0.2 }}>{title}</div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 22, padding: '2px 16px' }}>
                {items.map((c, i) => (
                    <div key={i} style={{ borderTop: i ? '1px solid var(--line)' : 'none' }}>{c}</div>
                ))}
            </div>
        </div>
    );
}

function OptionSheet({ open, onClose, title, options, value, onSelect }) {
    return (
        <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader className="text-center">
                        <DrawerTitle style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>{title}</DrawerTitle>
                    </DrawerHeader>
                    <div style={{ padding: '4px 20px 28px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {options.map((opt) => {
                            const active = opt.value === value;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => { onSelect(opt.value); onClose(); }}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '14px 16px', borderRadius: 16, cursor: 'pointer',
                                        border: '1px solid ' + (active ? hexA('#3f6f63', 0.4) : 'var(--line)'),
                                        background: active ? hexA('#3f6f63', 0.08) : 'var(--surface)',
                                        font: '600 14.5px var(--sans)', color: 'var(--ink)',
                                    }}
                                >
                                    <span>{opt.label}</span>
                                    {active && <Check size={18} strokeWidth={2.4} style={{ color: 'var(--pine)' }} />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

function EditNameSheet({ open, onClose, initialName }) {
    const [name, setName] = useState(initialName || '');

    // Resynchronise le champ avec le nom courant à chaque ouverture
    // (pattern "ajuster l'état pendant le rendu" — pas de useEffect, pas de re-render en cascade)
    const [prevOpen, setPrevOpen] = useState(open);
    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) setName(initialName || '');
    }
    const valid = name.trim().length >= 2;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!valid) return;
        await updateSetting('userName', name.trim());
        onClose();
    };

    return (
        <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader className="text-center">
                        <DrawerTitle style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>Votre nom</DrawerTitle>
                        <DrawerDescription>Comment souhaitez-vous qu&apos;on vous appelle ?</DrawerDescription>
                    </DrawerHeader>
                    <form onSubmit={handleSubmit} style={{ padding: '4px 20px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Votre prénom"
                            autoFocus
                            className="h-12 rounded-2xl text-base text-center"
                        />
                        <Button type="submit" disabled={!valid} className="w-full h-12 rounded-2xl font-bold">
                            Enregistrer
                        </Button>
                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function SettingsPage() {
    const navigate = useNavigate();
    const accounts = useAccounts();
    const categories = useCategories();
    const settings = useSettings();
    const { currency, setCurrency, supportedCurrencies } = useCurrency();
    const { theme, setTheme } = useTheme();

    const [editingName, setEditingName] = useState(false);
    const [currencySheetOpen, setCurrencySheetOpen] = useState(false);
    const [themeSheetOpen, setThemeSheetOpen] = useState(false);

    const currencyMeta = supportedCurrencies.find((c) => c.code === currency);
    const themeLabel = THEME_OPTIONS.find((t) => t.value === theme)?.label || 'Système';

    const visibleCategories = categories.filter((c) => c.name !== 'Transfert');
    const userName = settings?.userName;
    const initials = userName ? userName.trim().slice(0, 2).toUpperCase() : 'TR';

    return (
        <div style={{ padding: '0 20px 124px' }}>
            <div style={{ padding: '8px 0 16px' }}>
                <h1 style={{ fontFamily: 'var(--serif)', fontSize: 34, color: 'var(--ink)', margin: 0, lineHeight: 1 }}>Réglages</h1>
            </div>

            {/* profil */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 15, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 24, padding: 16 }}>
                <div style={{
                    width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(150deg,#3f6f63,#2a4a42)',
                    color: '#f4f1e8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--serif)', fontSize: 24, flexShrink: 0,
                }}>{initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 21, color: 'var(--ink)', lineHeight: 1.1 }}>
                        {userName || 'Bienvenue'}
                    </div>
                    <div style={{ font: '480 12.5px var(--sans)', color: 'var(--ink-muted)', marginTop: 3 }}>
                        {accounts.length} compte{accounts.length > 1 ? 's' : ''} · {currencyMeta?.label || currency}
                    </div>
                </div>
                <button
                    onClick={() => setEditingName(true)}
                    aria-label="Modifier le nom"
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ink-muted)', display: 'flex', padding: 6 }}
                >
                    <Pencil size={18} strokeWidth={1.8} />
                </button>
            </div>

            <Group title="Configuration">
                <SettingsRow icon={Wallet} color="#3f6f63" label="Comptes" detail={String(accounts.length)} onClick={() => navigate('/settings/accounts')} />
                <SettingsRow icon={ShoppingBag} color="#b4623f" label="Catégories" detail={String(visibleCategories.length)} onClick={() => navigate('/settings/categories')} />
                <SettingsRow icon={Target} color="#b08a4f" label="Budgets & objectifs" badge="Bientôt" />
            </Group>

            <Group title="Préférences">
                <SettingsRow icon={Repeat2} color="#5b76b0" label="Devise" detail={currencyMeta?.symbol || currency} onClick={() => setCurrencySheetOpen(true)} />
                <SettingsRow icon={Sparkles} color="#8c6a9e" label="Apparence" detail={themeLabel} onClick={() => setThemeSheetOpen(true)} />
                <SettingsRow icon={Bell} color="#b06a7a" label="Rappels quotidiens" badge="Bientôt" />
            </Group>

            <Group title="Données">
                <SettingsRow icon={ArrowLeftRight} color="#4f8a86" label="Importer / Exporter" onClick={() => navigate('/settings/data')} />
                <SettingsRow icon={PiggyBank} color="#3f6f63" label="Sauvegarde cloud" badge="Bientôt" />
            </Group>

            <div style={{ textAlign: 'center', marginTop: 30, color: 'var(--ink-muted)' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--ink-soft)' }}>Trackly</div>
                <div style={{ font: '460 11.5px var(--sans)', marginTop: 4 }}>Version 2.0 · 100% hors‑ligne</div>
            </div>

            <OptionSheet
                open={currencySheetOpen}
                onClose={() => setCurrencySheetOpen(false)}
                title="Devise principale"
                value={currency}
                onSelect={setCurrency}
                options={supportedCurrencies.map((c) => ({ value: c.code, label: `${c.label} (${c.symbol})` }))}
            />
            <OptionSheet
                open={themeSheetOpen}
                onClose={() => setThemeSheetOpen(false)}
                title="Apparence"
                value={theme}
                onSelect={setTheme}
                options={THEME_OPTIONS}
            />
            <EditNameSheet open={editingName} onClose={() => setEditingName(false)} initialName={userName} />
        </div>
    );
}
