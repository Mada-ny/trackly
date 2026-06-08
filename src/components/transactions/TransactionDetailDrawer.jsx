import { useState } from "react";
import { Drawer, DrawerContent, DrawerTitle } from "../ui/drawer";
import { GlyphChip } from "@/components/ui/glyph-chip";
import { getCategoryVisuals } from "@/utils/ui/iconMap";
import { Calendar, CreditCard, Tag, Pencil, Trash2, ArrowLeftRight } from "lucide-react";
import { format } from "date-fns";

// ── Helpers ────────────────────────────────────────────────────────────────

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

function formatCFA(n, { sign = false } = {}) {
    const v = Math.round(Math.abs(n));
    const body = v.toLocaleString('fr-FR');
    const prefix = sign ? (n < 0 ? '−' : '+') : (n < 0 ? '−' : '');
    return `${prefix}${body} F`;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function DetailRow({ icon: Icon, label, value }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 0',
        }}>
            <span style={{ color: 'var(--ink-muted)', display: 'flex', flexShrink: 0 }}>
                <Icon size={19} strokeWidth={1.7} />
            </span>
            <span style={{ font: '480 13.5px var(--sans)', color: 'var(--ink-muted)', flexShrink: 0 }}>
                {label}
            </span>
            <span style={{ flex: 1 }} />
            <span style={{ font: '600 14px var(--sans)', color: 'var(--ink)', textAlign: 'right' }}>
                {value}
            </span>
        </div>
    );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function TransactionDetailDrawer({ open, onOpenChange, transaction, onEdit, onDelete }) {
    const [confirmDelete, setConfirmDelete] = useState(false);

    if (!transaction) return null;

    const { icon, color } = transaction.isTransfer
        ? { icon: ArrowLeftRight, color: '#8a8170' }
        : getCategoryVisuals(transaction.category);

    const amount = transaction.isTransfer
        ? 0
        : transaction.isIncome
            ? transaction.amount
            : -Math.abs(transaction.amount);

    const amountColor = transaction.isTransfer
        ? 'var(--ink-muted)'
        : transaction.isIncome ? 'var(--pine)' : 'var(--ink)';

    const amountStr = transaction.isTransfer
        ? formatCFA(transaction.amount)
        : formatCFA(amount, { sign: true });

    const date = new Date(transaction.date);
    const timeStr = format(date, 'HH:mm');
    const dateLabel = `${relativeDay(date)} · ${timeStr}`;

    const detailRows = [
        { icon: Calendar, label: 'Date', value: dateLabel },
        { icon: CreditCard, label: 'Compte', value: transaction.account?.name || '—' },
        { icon: transaction.isTransfer ? ArrowLeftRight : Tag, label: 'Catégorie', value: transaction.isTransfer ? 'Virement' : (transaction.category?.name || '—') },
    ];

    const handleDelete = () => {
        onDelete(transaction.id);
        setConfirmDelete(false);
        onOpenChange(false);
    };

    const handleOpenChange = (v) => {
        if (!v) setConfirmDelete(false);
        onOpenChange(v);
    };

    return (
        <Drawer open={open} onOpenChange={handleOpenChange}>
            <DrawerContent
                aria-describedby={undefined}
                style={{ background: 'var(--paper)', borderRadius: '28px 28px 0 0', maxHeight: '92dvh' }}
            >
                <div style={{ padding: '6px 20px 32px', overflowY: 'auto' }} className="no-sb">
                    <DrawerTitle className="sr-only">{transaction.description}</DrawerTitle>

                    {/* Icon + description + amount */}
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        textAlign: 'center', paddingTop: 8,
                    }}>
                        <GlyphChip icon={icon} color={color} size={64} radius={20} soft={0.14} />

                        <div style={{
                            font: '500 13px var(--sans)', color: 'var(--ink-muted)',
                            marginTop: 16,
                        }}>
                            {transaction.description}
                        </div>

                        <div style={{
                            fontFamily: 'var(--serif)',
                            fontSize: 44,
                            color: amountColor,
                            marginTop: 4,
                            fontVariantNumeric: 'tabular-nums',
                            whiteSpace: 'nowrap',
                            lineHeight: 1.1,
                        }}>
                            {amountStr}
                        </div>
                    </div>

                    {/* Detail rows card */}
                    <div style={{
                        background: 'var(--surface)', border: '1px solid var(--line)',
                        borderRadius: 20, padding: '4px 16px',
                        marginTop: 24,
                    }}>
                        {detailRows.map((r, i) => (
                            <div key={i} style={{ borderTop: i > 0 ? '1px solid var(--line)' : 'none' }}>
                                <DetailRow icon={r.icon} label={r.label} value={r.value} />
                            </div>
                        ))}
                    </div>

                    {/* Action buttons */}
                    {!confirmDelete ? (
                        <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
                            <button
                                onClick={() => { onEdit(transaction); handleOpenChange(false); }}
                                style={{
                                    flex: 1, height: 52, borderRadius: 16, cursor: 'pointer',
                                    border: '1px solid var(--line)', background: 'var(--surface)',
                                    font: '600 15px var(--sans)', color: 'var(--ink)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                }}
                            >
                                <Pencil size={18} strokeWidth={1.8} />
                                Modifier
                            </button>
                            <button
                                onClick={() => setConfirmDelete(true)}
                                aria-label="Supprimer"
                                style={{
                                    width: 52, height: 52, borderRadius: 16, cursor: 'pointer', flexShrink: 0,
                                    border: '1px solid rgba(180,98,63,0.3)',
                                    background: 'rgba(180,98,63,0.08)',
                                    color: 'var(--clay)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                <Trash2 size={19} strokeWidth={1.8} />
                            </button>
                        </div>
                    ) : (
                        <div style={{ marginTop: 22 }}>
                            <div style={{
                                font: '500 13.5px var(--sans)', color: 'var(--ink-soft)',
                                textAlign: 'center', marginBottom: 12,
                            }}>
                                Supprimer cette opération ?
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button
                                    onClick={() => setConfirmDelete(false)}
                                    style={{
                                        flex: 1, height: 52, borderRadius: 16, cursor: 'pointer',
                                        border: '1px solid var(--line)', background: 'var(--surface)',
                                        font: '600 14px var(--sans)', color: 'var(--ink-soft)',
                                    }}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleDelete}
                                    style={{
                                        flex: 1, height: 52, borderRadius: 16, cursor: 'pointer',
                                        border: 'none', background: 'var(--clay)',
                                        font: '600 14px var(--sans)', color: '#fff',
                                    }}
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
}
