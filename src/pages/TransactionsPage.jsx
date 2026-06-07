import { useState, useDeferredValue } from "react";
import { useLocation } from "react-router";
import { Search, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { useEnrichedTransactions } from "@/utils/db/hooks/transactions/useEnrichedTransactions";
import { useTransactionFilters } from "@/utils/db/hooks/transactions/useTransactionFilters";
import { useFilteredTransactions } from "@/utils/db/hooks/transactions/useFilteredTransactions";
import { useAccounts, useCategories } from "@/utils/db/hooks";
import { GlyphChip } from "@/components/ui/glyph-chip";
import { getCategoryVisuals, getAccountVisuals } from "@/utils/ui/iconMap";
import FilterDrawer from "@/components/transactions/FilterDrawer";
import TransactionDetailDrawer from "@/components/transactions/TransactionDetailDrawer";
import QuickAddSheet from "@/components/transactions/QuickAddSheet";
import { toast } from "sonner";
import { db } from "@/utils/db/schema";

// ── Helpers ───────────────────────────────────────────────────────────────

function formatCFA(n, { sign = false } = {}) {
    const v = Math.round(Math.abs(n));
    const body = v.toLocaleString('fr-FR');
    const prefix = sign ? (n < 0 ? '−' : '+') : (n < 0 ? '−' : '');
    return `${prefix}${body} F`;
}

const DAYS_SHORT = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const MONTHS_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function relativeDay(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (sameDay(date, today)) return "Aujourd'hui";
    if (sameDay(date, yesterday)) return 'Hier';
    return `${DAYS_SHORT[date.getDay()]} ${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}

function groupByDay(txs) {
    const groups = [];
    let cur = null;
    txs.forEach(t => {
        const key = t.date.toDateString();
        if (!cur || cur.key !== key) {
            cur = { key, date: t.date, items: [] };
            groups.push(cur);
        }
        cur.items.push(t);
    });
    groups.forEach(g => {
        g.spent = g.items
            .filter(i => !i.isIncome && !i.isTransfer)
            .reduce((s, i) => s + Math.abs(i.amount), 0);
    });
    return groups;
}

// ── Sub-components ────────────────────────────────────────────────────────

const SEGMENTS = [
    { id: 'all',      label: 'Tout' },
    { id: 'income',   label: 'Revenus' },
    { id: 'expense',  label: 'Dépenses' },
    { id: 'transfer', label: 'Virements' },
];

function SegmentedControl({ value, onChange }) {
    return (
        <div style={{ display: 'flex', gap: 4, background: 'rgba(60,52,38,0.05)', borderRadius: 14, padding: 4 }}>
            {SEGMENTS.map(o => {
                const active = value === o.id;
                return (
                    <button
                        key={o.id}
                        onClick={() => onChange(o.id)}
                        style={{
                            flex: 1, border: 'none', cursor: 'pointer', borderRadius: 11, padding: '8px 0',
                            font: active ? '620 13px var(--sans)' : '500 13px var(--sans)',
                            color: active ? 'var(--ink)' : 'var(--ink-muted)',
                            background: active ? 'var(--surface)' : 'transparent',
                            boxShadow: active ? '0 1px 4px rgba(40,34,24,0.08)' : 'none',
                            transition: 'all .15s',
                        }}
                    >
                        {o.label}
                    </button>
                );
            })}
        </div>
    );
}

function TxRow({ tx, showBorder, onClick }) {
    const { icon, color } = tx.isTransfer
        ? { icon: getAccountVisuals(tx.account).icon, color: '#8a8170' }
        : getCategoryVisuals(tx.category);
    const timeStr = tx.date ? format(new Date(tx.date), 'HH:mm') : '';
    const signed = tx.isIncome ? tx.amount : -Math.abs(tx.amount);

    return (
        <button
            onClick={() => onClick(tx)}
            style={{
                width: '100%', border: 'none', background: 'none', cursor: 'pointer',
                borderTop: showBorder ? '1px solid var(--line)' : 'none',
                display: 'flex', alignItems: 'center', gap: 13, padding: '11px 4px', textAlign: 'left',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(63,111,99,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
        >
            <GlyphChip icon={icon} color={color} size={42} radius={13} soft={0.12} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    font: '600 15px/1.25 var(--sans)', color: 'var(--ink)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                    {tx.description}
                </div>
                <div style={{
                    font: '480 12.5px var(--sans)', color: 'var(--ink-muted)',
                    marginTop: 3, display: 'flex', alignItems: 'center', gap: 5,
                }}>
                    <span>{tx.account?.name}</span>
                    <span style={{ opacity: 0.5 }}>·</span>
                    <span>{timeStr}</span>
                </div>
            </div>
            <div style={{
                fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 680,
                color: tx.isTransfer ? 'var(--ink-muted)' : tx.isIncome ? 'var(--pine)' : 'var(--ink)',
                fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
            }}>
                {formatCFA(signed, { sign: true })}
            </div>
        </button>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function TransactionsPage() {
    const location = useLocation();

    const initialFilters = location.state?.initialFilters || {};
    const { filters, updateFilter, resetFilters, activeFilterCount } = useTransactionFilters(initialFilters);

    const [searchQuery, setSearchQuery] = useState('');
    const deferredSearch = useDeferredValue(searchQuery);
    const [filterOpen, setFilterOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedTx, setSelectedTx] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editTx, setEditTx] = useState(null);

    const allTransactions = useEnrichedTransactions();
    const accounts = useAccounts();
    const categories = useCategories();

    const searched = !deferredSearch.trim()
        ? allTransactions
        : allTransactions.filter(t => {
            const q = deferredSearch.toLowerCase();
            return (
                t.description.toLowerCase().includes(q) ||
                t.category?.name?.toLowerCase().includes(q) ||
                t.account?.name?.toLowerCase().includes(q)
            );
        });

    const filtered = useFilteredTransactions(searched, filters);
    const groups = groupByDay(filtered);

    // Badge count = all active filters except type (type is in the segmented control)
    const extraFilterCount = activeFilterCount - (filters.type ? 1 : 0);
    const segValue = filters.type || 'all';

    const handleTxClick = (tx) => {
        setSelectedTx(tx);
        setDetailOpen(true);
    };

    const handleEdit = (tx) => {
        setEditTx(tx);
        setEditOpen(true);
    };

    const handleDelete = async (txId) => {
        try {
            const tx = allTransactions.find(t => t.id === txId);
            if (tx?.isTransfer && tx.transferId) {
                await db.transactions.where('transferId').equals(tx.transferId).delete();
                toast.success('Virement supprimé');
            } else {
                await db.transactions.delete(txId);
                toast.success('Transaction supprimée');
            }
        } catch (err) {
            toast.error('Erreur lors de la suppression');
            console.error(err);
        }
    };

    const now = new Date();
    const monthLabel = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    return (
        <div
            className="no-sb"
            style={{ overflowY: 'auto', background: 'var(--paper)', minHeight: '100dvh' }}
        >
            <div style={{ padding: '0 20px 124px' }}>

                {/* Header */}
                <div style={{
                    padding: '8px 0 14px',
                    paddingTop: 'max(8px, calc(env(safe-area-inset-top) + 8px))',
                }}>
                    <h1 style={{
                        fontFamily: 'var(--serif)', fontSize: 34, color: 'var(--ink)',
                        margin: 0, lineHeight: 1,
                    }}>
                        Transactions
                    </h1>
                    <div style={{ font: '480 13px var(--sans)', color: 'var(--ink-muted)', marginTop: 6 }}>
                        {allTransactions.length} opération{allTransactions.length !== 1 ? 's' : ''} · {monthLabel}
                    </div>
                </div>

                {/* Search + Filter */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <span style={{ position: 'absolute', left: 14, color: 'var(--ink-muted)', display: 'flex', pointerEvents: 'none' }}>
                            <Search size={18} strokeWidth={1.8} />
                        </span>
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Rechercher…"
                            style={{
                                width: '100%', boxSizing: 'border-box', height: 46,
                                paddingLeft: 42, paddingRight: searchQuery ? 42 : 14,
                                borderRadius: 15, border: '1px solid var(--line)',
                                background: 'var(--surface)', font: '500 14.5px var(--sans)',
                                color: 'var(--ink)', outline: 'none',
                            }}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                aria-label="Effacer la recherche"
                                style={{
                                    position: 'absolute', right: 12, border: 'none', background: 'none',
                                    cursor: 'pointer', color: 'var(--ink-muted)', display: 'flex',
                                    alignItems: 'center', padding: 2,
                                }}
                            >
                                <X size={16} strokeWidth={2} />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setFilterOpen(true)}
                        aria-label="Filtrer"
                        style={{
                            width: 46, height: 46, borderRadius: 15, cursor: 'pointer',
                            border: '1px solid ' + (extraFilterCount > 0 ? 'transparent' : 'var(--line)'),
                            background: extraFilterCount > 0 ? 'var(--pine)' : 'var(--surface)',
                            color: extraFilterCount > 0 ? '#fff' : 'var(--ink-soft)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative', flexShrink: 0,
                        }}
                    >
                        <Filter size={20} strokeWidth={1.8} />
                        {extraFilterCount > 0 && (
                            <span style={{
                                position: 'absolute', top: -6, right: -6,
                                minWidth: 18, height: 18, padding: '0 4px', borderRadius: 99,
                                background: 'var(--clay)', color: '#fff',
                                font: '700 11px var(--sans)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '2px solid var(--paper)',
                            }}>
                                {extraFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Segmented control */}
                <div style={{ marginBottom: activeFilterCount > 0 ? 12 : 18 }}>
                    <SegmentedControl
                        value={segValue}
                        onChange={v => updateFilter('type', v === 'all' ? null : v)}
                    />
                </div>

                {/* Active filter summary row */}
                {activeFilterCount > 0 && (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginBottom: 16, padding: '0 2px',
                    }}>
                        <span style={{ font: '500 12.5px var(--sans)', color: 'var(--ink-muted)' }}>
                            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''} · {activeFilterCount} filtre{activeFilterCount !== 1 ? 's' : ''}
                        </span>
                        <button
                            onClick={resetFilters}
                            style={{
                                border: 'none', background: 'none', cursor: 'pointer', padding: 0,
                                font: '550 12.5px var(--sans)', color: 'var(--clay)',
                                display: 'flex', alignItems: 'center', gap: 4,
                            }}
                        >
                            <X size={13} strokeWidth={2.2} /> Effacer
                        </button>
                    </div>
                )}

                {/* Empty state */}
                {groups.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-muted)' }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: 20, background: 'rgba(60,52,38,0.05)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px', color: 'var(--ink-muted)',
                        }}>
                            <Search size={26} strokeWidth={1.6} />
                        </div>
                        <div style={{ font: '600 15px var(--sans)', color: 'var(--ink-soft)' }}>
                            {allTransactions.length === 0 ? 'Aucune transaction' : 'Aucun résultat'}
                        </div>
                        <div style={{ font: '460 13px var(--sans)', marginTop: 4 }}>
                            {allTransactions.length === 0
                                ? 'Ajoutez votre première transaction avec le bouton +'
                                : 'Essayez d\'autres mots-clés ou filtres.'
                            }
                        </div>
                    </div>
                )}

                {/* Date-grouped list */}
                {groups.map(g => (
                    <div key={g.key} style={{ marginBottom: 8 }}>
                        <div style={{
                            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                            padding: '14px 4px 4px',
                        }}>
                            <span style={{ font: '600 13px var(--sans)', color: 'var(--ink-soft)' }}>
                                {relativeDay(g.date)}
                            </span>
                            {g.spent > 0 && (
                                <span style={{ font: '500 12px var(--sans)', color: 'var(--ink-muted)', fontVariantNumeric: 'tabular-nums' }}>
                                    −{formatCFA(g.spent)}
                                </span>
                            )}
                        </div>
                        <div style={{
                            background: 'var(--surface)', border: '1px solid var(--line)',
                            borderRadius: 20, padding: '3px 14px',
                        }}>
                            {g.items.map((t, i) => (
                                <TxRow key={t.id} tx={t} showBorder={i > 0} onClick={handleTxClick} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <FilterDrawer
                open={filterOpen}
                onOpenChange={setFilterOpen}
                filters={filters}
                updateFilter={updateFilter}
                resetFilters={resetFilters}
                accounts={accounts}
                categories={categories}
            />

            <TransactionDetailDrawer
                open={detailOpen}
                onOpenChange={setDetailOpen}
                transaction={selectedTx}
                onEdit={tx => { handleEdit(tx); setDetailOpen(false); }}
                onDelete={handleDelete}
            />

            <QuickAddSheet
                open={editOpen}
                onOpenChange={setEditOpen}
                editTransaction={editTx}
            />
        </div>
    );
}
