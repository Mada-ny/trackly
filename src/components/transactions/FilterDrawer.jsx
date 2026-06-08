import { useState } from "react";
import { Drawer, DrawerContent, DrawerTitle } from "../ui/drawer";
import { getCategoryVisuals, getAccountVisuals } from "@/utils/ui/iconMap";
import { RotateCcw, TrendingUp, TrendingDown, ArrowLeftRight, Filter } from "lucide-react";
import DatePicker from "@/components/date/DatePicker";

// ── Helpers ────────────────────────────────────────────────────────────────

function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function hexA(hex, a) {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
}

function periodToDateRange(period) {
    if (period === 'all') return { start: null, end: null };
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    if (period === '7') start.setDate(start.getDate() - 6);
    else if (period === '30') start.setDate(start.getDate() - 29);
    else if (period === 'month') start.setDate(1);
    return { start, end: today };
}

function dateRangeToPeriod(dateRange) {
    if (!dateRange?.start && !dateRange?.end) return 'all';
    if (!dateRange.start || !dateRange.end) return 'custom';
    const today = new Date();
    const start = new Date(dateRange.start);
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((today - start) / 86400000);
    if (diff === 6) return '7';
    if (diff === 29) return '30';
    if (start.getDate() === 1 && start.getMonth() === today.getMonth()) return 'month';
    return 'custom';
}

function buildDraft(filters) {
    const period = dateRangeToPeriod(filters.dateRange);
    return {
        accountIds: filters.accountIds || [],
        categoryIds: filters.categoryIds || [],
        type: filters.type || null,
        period,
        from: period === 'custom' && filters.dateRange?.start ? new Date(filters.dateRange.start) : null,
        to:   period === 'custom' && filters.dateRange?.end   ? new Date(filters.dateRange.end)   : null,
        amountMin: filters.amountRange?.min != null ? String(filters.amountRange.min) : '',
        amountMax: filters.amountRange?.max != null ? String(filters.amountRange.max) : '',
    };
}

function filterCount(draft) {
    return (draft.type ? 1 : 0)
        + draft.accountIds.length
        + draft.categoryIds.length
        + (draft.period !== 'all' ? 1 : 0)
        + ((draft.amountMin || draft.amountMax) ? 1 : 0);
}

const EMPTY_DRAFT = { accountIds: [], categoryIds: [], type: null, period: 'all', from: null, to: null, amountMin: '', amountMax: '' };

// ── Chip component ─────────────────────────────────────────────────────────

function Chip({ active, color = '#3f6f63', onClick, children, dot }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer',
                padding: '8px 14px', borderRadius: 99,
                border: '1px solid ' + (active ? hexA(color, 0.5) : 'var(--line)'),
                background: active ? hexA(color, 0.1) : 'var(--surface)',
                font: '550 13px var(--sans)',
                color: active ? 'var(--ink)' : 'var(--ink-soft)',
                transition: 'all .15s',
            }}
        >
            {dot && (
                <span style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: color,
                }} />
            )}
            {children}
        </button>
    );
}

// ── Section label ──────────────────────────────────────────────────────────

function FBlock({ label, children }) {
    return (
        <div style={{ marginTop: 22 }}>
            <div style={{
                font: '500 12.5px var(--sans)', color: 'var(--ink-muted)',
                margin: '0 2px 11px', letterSpacing: 0.2,
            }}>
                {label}
            </div>
            {children}
        </div>
    );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function FilterDrawer({ open, onOpenChange, filters, updateFilter, resetFilters, accounts = [], categories = [] }) {
    const [draft, setDraft] = useState(() => buildDraft(filters));

    // Réinitialise le brouillon depuis les filtres actifs à chaque ouverture
    // (pattern "ajuster l'état pendant le rendu" — pas de useEffect, pas de re-render en cascade)
    const [prevOpen, setPrevOpen] = useState(open);
    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) setDraft(buildDraft(filters));
    }

    const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));
    const toggle = (k, id) => setDraft(d => ({
        ...d,
        [k]: d[k].includes(id) ? d[k].filter(x => x !== id) : [...d[k], id],
    }));

    const n = filterCount(draft);

    const handleApply = () => {
        const minNum = parseFloat(draft.amountMin);
        const maxNum = parseFloat(draft.amountMax);

        let dateRange;
        if (draft.period === 'custom') {
            const endOfDay = (d) => d ? new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999) : null;
            const startOfDay = (d) => d ? new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0) : null;
            dateRange = { start: startOfDay(draft.from), end: endOfDay(draft.to) };
        } else {
            dateRange = periodToDateRange(draft.period);
        }

        updateFilter('accountIds', draft.accountIds);
        updateFilter('categoryIds', draft.categoryIds);
        updateFilter('type', draft.type);
        updateFilter('dateRange', dateRange);
        updateFilter('amountRange', {
            min: isNaN(minNum) ? null : minNum,
            max: isNaN(maxNum) ? null : maxNum,
        });
        onOpenChange(false);
    };

    const handleReset = () => {
        setDraft({ ...EMPTY_DRAFT });
        resetFilters();
    };

    // Exclude "Transfert" category from filter list
    const filteredCats = categories.filter(c => c.name !== 'Transfert');

    const inputStyle = {
        width: '100%', boxSizing: 'border-box', height: 46, padding: '0 14px', borderRadius: 14,
        border: '1px solid var(--line)', background: 'var(--surface)',
        font: '500 14.5px var(--sans)', color: 'var(--ink)', outline: 'none',
        fontVariantNumeric: 'tabular-nums',
    };

    const PERIODS = [
        { id: 'all',    label: 'Toutes' },
        { id: '7',      label: '7 jours' },
        { id: '30',     label: '30 jours' },
        { id: 'month',  label: 'Ce mois' },
        { id: 'custom', label: 'Personnalisée' },
    ];

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent
                aria-describedby={undefined}
                style={{ background: 'var(--paper)', borderRadius: '28px 28px 0 0', maxHeight: '92dvh' }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '92dvh' }}>

                    {/* Header */}
                    <div style={{ padding: '4px 20px 0', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
                            <DrawerTitle style={{
                                fontFamily: 'var(--serif)', fontSize: 27,
                                color: 'var(--ink)', margin: 0, lineHeight: 1,
                            }}>
                                Filtrer
                            </DrawerTitle>
                            <button
                                onClick={handleReset}
                                disabled={n === 0}
                                style={{
                                    border: 'none', background: 'none',
                                    cursor: n > 0 ? 'pointer' : 'default', padding: 0,
                                    font: '550 13.5px var(--sans)',
                                    color: n > 0 ? 'var(--clay)' : 'var(--ink-muted)',
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    opacity: n === 0 ? 0.5 : 1,
                                }}
                            >
                                <RotateCcw size={15} strokeWidth={2} />
                                Réinitialiser
                            </button>
                        </div>
                    </div>

                    {/* Scrollable body */}
                    <div className="no-sb" style={{ overflowY: 'auto', flex: 1, padding: '0 20px 8px' }}>

                        {/* Type */}
                        <FBlock label="Type de transaction">
                            <div style={{ display: 'flex', gap: 9 }}>
                                {[
                                    { id: 'income',   label: 'Revenus',    Icon: TrendingUp,    color: '#3f6f63' },
                                    { id: 'expense',  label: 'Dépenses',   Icon: TrendingDown,  color: '#b4623f' },
                                    { id: 'transfer', label: 'Virements', Icon: ArrowLeftRight, color: '#5b76b0' },
                                ].map(o => {
                                    const active = draft.type === o.id;
                                    return (
                                        <button
                                            key={o.id}
                                            onClick={() => set('type', active ? null : o.id)}
                                            style={{
                                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                gap: 8, cursor: 'pointer', height: 48, borderRadius: 14,
                                                border: '1px solid ' + (active ? hexA(o.color, 0.5) : 'var(--line)'),
                                                background: active ? hexA(o.color, 0.1) : 'var(--surface)',
                                                font: '600 14px var(--sans)',
                                                color: active ? 'var(--ink)' : 'var(--ink-soft)',
                                                transition: 'all .15s',
                                            }}
                                        >
                                            <span style={{ color: o.color, display: 'flex' }}>
                                                <o.Icon size={17} strokeWidth={2.1} />
                                            </span>
                                            {o.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </FBlock>

                        {/* Accounts */}
                        {accounts.length > 0 && (
                            <FBlock label="Comptes">
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {accounts.map(acc => {
                                        const { color } = getAccountVisuals(acc);
                                        const active = draft.accountIds.includes(acc.id);
                                        return (
                                            <Chip
                                                key={acc.id}
                                                active={active}
                                                color={color}
                                                dot
                                                onClick={() => toggle('accountIds', acc.id)}
                                            >
                                                {acc.name}
                                            </Chip>
                                        );
                                    })}
                                </div>
                            </FBlock>
                        )}

                        {/* Categories — single section, no income/expense split */}
                        {filteredCats.length > 0 && (
                            <FBlock label="Catégories">
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {filteredCats.map(cat => {
                                        const { icon: CatIcon, color } = getCategoryVisuals(cat);
                                        const active = draft.categoryIds.includes(cat.id);
                                        return (
                                            <Chip
                                                key={cat.id}
                                                active={active}
                                                color={color}
                                                onClick={() => toggle('categoryIds', cat.id)}
                                            >
                                                <span style={{ color, display: 'flex' }}>
                                                    <CatIcon size={15} strokeWidth={1.9} />
                                                </span>
                                                {cat.name}
                                            </Chip>
                                        );
                                    })}
                                </div>
                            </FBlock>
                        )}

                        {/* Period */}
                        <FBlock label="Période">
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {PERIODS.map(p => (
                                    <Chip
                                        key={p.id}
                                        active={draft.period === p.id}
                                        onClick={() => set('period', p.id)}
                                    >
                                        {p.label}
                                    </Chip>
                                ))}
                            </div>
                            {draft.period === 'custom' && (
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginTop: 12 }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ font: '500 11.5px var(--sans)', color: 'var(--ink-muted)', margin: '0 2px 6px' }}>Du</div>
                                        <DatePicker
                                            value={draft.from}
                                            onChange={d => set('from', d)}
                                            maxDate={draft.to || undefined}
                                            placeholder="Choisir"
                                        />
                                    </div>
                                    <span style={{ color: 'var(--ink-muted)', paddingBottom: 11, flexShrink: 0 }}>—</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ font: '500 11.5px var(--sans)', color: 'var(--ink-muted)', margin: '0 2px 6px' }}>Au</div>
                                        <DatePicker
                                            value={draft.to}
                                            onChange={d => set('to', d)}
                                            minDate={draft.from || undefined}
                                            placeholder="Choisir"
                                        />
                                    </div>
                                </div>
                            )}
                        </FBlock>

                        {/* Amount */}
                        <FBlock label="Montant (F CFA)">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    placeholder="Min"
                                    value={draft.amountMin}
                                    onChange={e => set('amountMin', e.target.value)}
                                    style={inputStyle}
                                />
                                <span style={{ color: 'var(--ink-muted)', flexShrink: 0 }}>—</span>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    placeholder="Max"
                                    value={draft.amountMax}
                                    onChange={e => set('amountMax', e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                        </FBlock>

                        <div style={{ height: 8 }} />
                    </div>

                    {/* Apply button */}
                    <div style={{
                        padding: '16px 20px',
                        paddingBottom: 'max(16px, calc(env(safe-area-inset-bottom) + 16px))',
                        flexShrink: 0,
                    }}>
                        <button
                            onClick={handleApply}
                            style={{
                                width: '100%', height: 54, borderRadius: 16, cursor: 'pointer',
                                border: 'none', background: 'var(--pine)', color: '#fff',
                                font: '650 15.5px var(--sans)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                boxShadow: '0 8px 20px rgba(44,84,72,0.28)',
                            }}
                        >
                            <Filter size={18} strokeWidth={2} />
                            {n > 0 ? `Appliquer · ${n} filtre${n > 1 ? 's' : ''}` : 'Appliquer'}
                        </button>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

// Named export kept for legacy desktop sidebar usage
export function FilterDrawerContent() { return null; }
