import { useState, useEffect, useRef } from "react";
import { Drawer, DrawerContent, DrawerTitle } from "../ui/drawer";
import { GlyphChip } from "@/components/ui/glyph-chip";
import { getCategoryVisuals, getAccountVisuals } from "@/utils/ui/iconMap";
import { useAccounts, useCategories } from "@/utils/db/hooks";
import { db } from "@/utils/db/schema";
import { buildDateTime } from "@/utils/date/buildDateTime";
import { getAccountBalance } from "@/utils/db/calculations";
import DatePicker from "@/components/date/DatePicker";
import { toast } from "sonner";
import { ArrowLeftRight, Delete, X, Check, Calendar, ChevronDown } from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────

function pad2(n) { return String(n).padStart(2, '0'); }

function isToday(d) {
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function hexA(hex, a) {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
}

function makeInitialState() {
    const now = new Date();
    return {
        type: 'expense',
        amount: '0',
        catId: null,
        accId: null,
        fromAccId: null,
        toAccId: null,
        date: now,
        time: `${pad2(now.getHours())}:${pad2(now.getMinutes())}`,
        note: '',
    };
}

// ── Constants ─────────────────────────────────────────────────────────────

const TYPE_ACCENT = { expense: 'var(--clay)', income: 'var(--pine)', transfer: '#5b76b0' };
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '000'];

// ── Sub-components ────────────────────────────────────────────────────────

function AccBtn({ account, active, accent, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer',
                padding: '8px 13px', borderRadius: 12,
                border: '1px solid ' + (active ? accent : 'var(--line)'),
                background: active ? hexA('#3f6f63', 0.07) : 'var(--surface)',
                transition: 'all .15s',
            }}
        >
            <span style={{ width: 8, height: 8, borderRadius: 99, background: account.color || '#8a8170', flexShrink: 0 }} />
            <span style={{ font: '550 13px var(--sans)', color: active ? 'var(--ink)' : 'var(--ink-soft)' }}>
                {account.name}
            </span>
        </button>
    );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function QuickAddSheet({ open, onOpenChange, editTransaction = null }) {
    const accounts = useAccounts();
    const categories = useCategories();

    const [state, setState] = useState(makeInitialState);
    const { type, amount, catId, accId, fromAccId, toAccId, date, time, note } = state;
    const [dateExpanded, setDateExpanded] = useState(false);
    const [transferPair, setTransferPair] = useState(null);

    const isEdit = !!editTransaction;
    const editIsTransfer = isEdit && editTransaction.isTransfer && !!editTransaction.transferId;

    const initRef = useRef(false);

    const set = (k, v) => setState(s => ({ ...s, [k]: v }));

    const selectType = (newType) => setState(s => ({ ...s, type: newType, catId: null }));

    // Load the linked pair when editing a transfer
    useEffect(() => {
        if (open && editIsTransfer) {
            db.transactions.where('transferId').equals(editTransaction.transferId).toArray().then(setTransferPair);
        } else {
            setTransferPair(null);
        }
    }, [open, editIsTransfer, editTransaction?.transferId]);

    // One-shot init per open session: prefill from editTransaction, or set defaults for a new entry
    useEffect(() => {
        if (!open) { initRef.current = false; setDateExpanded(false); return; }
        if (initRef.current || accounts.length === 0 || categories.length === 0) return;

        if (!editTransaction) {
            initRef.current = true;
            setState({
                ...makeInitialState(),
                accId: accounts[0].id,
                fromAccId: accounts[0].id,
                toAccId: accounts[Math.min(1, accounts.length - 1)].id,
            });
            return;
        }

        if (editIsTransfer) {
            if (!transferPair || transferPair.length !== 2) return;
            const fromT = transferPair.find(t => t.amount < 0);
            const toT = transferPair.find(t => t.amount > 0);
            if (!fromT || !toT) return;
            initRef.current = true;
            const d = new Date(fromT.date);
            setState({
                type: 'transfer',
                amount: String(Math.abs(fromT.amount)),
                catId: null,
                accId: accounts[0].id,
                fromAccId: fromT.accountId,
                toAccId: toT.accountId,
                date: d,
                time: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
                note: '',
            });
        } else {
            const category = categories.find(c => c.id === editTransaction.categoryId);
            initRef.current = true;
            const d = new Date(editTransaction.date);
            setState({
                type: category?.type === 'income' ? 'income' : 'expense',
                amount: String(Math.abs(editTransaction.amount)),
                catId: editTransaction.categoryId,
                accId: editTransaction.accountId,
                fromAccId: accounts[0].id,
                toAccId: accounts[Math.min(1, accounts.length - 1)].id,
                date: d,
                time: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
                note: editTransaction.description || '',
            });
        }
    }, [open, accounts, categories, editTransaction, editIsTransfer, transferPair]);

    const isIncome = type === 'income';
    const isTransfer = type === 'transfer';
    const accent = TYPE_ACCENT[type];
    const amountNum = parseInt(amount, 10) || 0;

    const cats = isIncome
        ? categories.filter(c => c.type === 'income')
        : categories.filter(c => c.type === 'expense' && c.name !== 'Transfert');

    const canSave = isTransfer
        ? amountNum > 0 && fromAccId !== toAccId
        : amountNum > 0 && catId !== null;

    const sign = isTransfer ? '' : isIncome ? '+' : '−';
    const amountColor = amountNum === 0
        ? 'var(--ink-muted)'
        : isTransfer ? accent : isIncome ? 'var(--pine)' : 'var(--ink)';

    const pressKey = (k) => {
        setState(s => {
            const a = s.amount;
            const isZero = a === '0';
            if (k === '00')  return { ...s, amount: isZero ? '0' : (a + '00').slice(0, 12) };
            if (k === '000') return { ...s, amount: isZero ? '0' : (a + '000').slice(0, 12) };
            return { ...s, amount: (isZero ? String(k) : a + String(k)).slice(0, 12) };
        });
    };

    const handleBackspace = () =>
        setState(s => ({ ...s, amount: s.amount.length <= 1 ? '0' : s.amount.slice(0, -1) }));

    const handleClearAmount = () => setState(s => ({ ...s, amount: '0' }));

    const swapAccounts = () =>
        setState(s => ({ ...s, fromAccId: s.toAccId, toAccId: s.fromAccId }));

    const handleSave = async () => {
        const datetime = buildDateTime(date, time);
        try {
            if (isTransfer) {
                let transferCat = await db.categories.where('name').equals('Transfert').first();
                if (!transferCat) {
                    const id = await db.categories.add({ name: 'Transfert', type: 'expense' });
                    transferCat = { id };
                }
                const balance = await getAccountBalance(fromAccId);
                // When editing, the source account's current balance already reflects the old transfer —
                // back it out before checking whether the new amount fits.
                const oldFromAmount = isEdit ? (transferPair?.find(t => t.amount < 0)?.amount ?? 0) : 0;
                if (balance - oldFromAmount - amountNum < 0) {
                    const fromAcc = accounts.find(a => a.id === fromAccId);
                    toast.error(`Solde insuffisant sur ${fromAcc?.name} (${(balance - oldFromAmount).toLocaleString()} F disponible).`);
                    return;
                }
                const tid = isEdit ? editTransaction.transferId : crypto.randomUUID();
                const fromAcc = accounts.find(a => a.id === fromAccId);
                const toAcc = accounts.find(a => a.id === toAccId);
                await db.transaction('rw', db.transactions, async () => {
                    if (isEdit) {
                        await db.transactions.where('transferId').equals(tid).delete();
                    }
                    await db.transactions.add({ date: datetime, accountId: fromAccId, categoryId: transferCat.id, amount: -amountNum, description: `Virement vers ${toAcc?.name}`, transferId: tid, isCycleStart: false });
                    await db.transactions.add({ date: datetime, accountId: toAccId,   categoryId: transferCat.id, amount:  amountNum, description: `Virement depuis ${fromAcc?.name}`, transferId: tid, isCycleStart: false });
                });
                toast.success(isEdit ? 'Virement modifié' : 'Virement enregistré');
            } else {
                const category = categories.find(c => c.id === catId);
                if (!category) return;
                const signedAmount = isIncome ? amountNum : -amountNum;
                if (!isIncome) {
                    const balance = await getAccountBalance(accId);
                    // Back out the old amount when editing, so changing the amount/account is checked correctly
                    const oldAmount = isEdit ? editTransaction.amount : 0;
                    if (balance - oldAmount + signedAmount < 0) {
                        const acc = accounts.find(a => a.id === accId);
                        toast.error(`Solde insuffisant sur ${acc?.name} (${(balance - oldAmount).toLocaleString()} F disponible).`);
                        return;
                    }
                }
                const payload = {
                    date: datetime, accountId: accId, categoryId: catId,
                    amount: signedAmount,
                    description: note.trim() || category.name,
                };
                if (isEdit) {
                    await db.transactions.update(editTransaction.id, payload);
                    toast.success('Transaction modifiée');
                } else {
                    await db.transactions.add({ ...payload, isCycleStart: false });
                    toast.success('Transaction enregistrée');
                }
            }
            onOpenChange(false);
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de l'enregistrement.");
        }
    };

    const fieldStyle = {
        boxSizing: 'border-box', height: 44, padding: '0 13px', borderRadius: 14,
        border: '1px solid var(--line)', background: 'var(--surface)',
        font: '550 14px var(--sans)', color: 'var(--ink)', outline: 'none',
        fontVariantNumeric: 'tabular-nums', colorScheme: 'light',
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent
                aria-describedby={undefined}
                style={{ background: 'var(--paper)', borderRadius: '28px 28px 0 0', height: '97dvh', maxHeight: '97dvh' }}
            >
                <DrawerTitle className="sr-only">{isEdit ? 'Modifier la saisie' : 'Nouvelle saisie'}</DrawerTitle>
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, paddingBottom: 'max(16px, calc(env(safe-area-inset-bottom) + 16px))' }}>

                    {/* ── Header ── */}
                    <div style={{ padding: '4px 22px 0', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <button
                                onClick={() => onOpenChange(false)}
                                style={{ border: 'none', background: 'none', color: 'var(--ink-muted)', font: '500 14px var(--sans)', cursor: 'pointer', padding: 0 }}
                            >
                                Annuler
                            </button>
                            <span style={{ font: '600 14px var(--sans)', color: 'var(--ink-soft)' }}>{isEdit ? 'Modifier la saisie' : 'Nouvelle saisie'}</span>
                            <span style={{ width: 56 }} />
                        </div>

                        {/* Type toggle */}
                        <div style={{ display: 'flex', gap: 4, background: 'rgba(60,52,38,0.05)', borderRadius: 14, padding: 4, marginTop: 14 }}>
                            {[
                                { id: 'expense',  label: 'Dépense'  },
                                { id: 'income',   label: 'Revenu'   },
                                { id: 'transfer', label: 'Virement' },
                            ].map(o => {
                                const active = type === o.id;
                                // Editing can't convert a transfer into a regular transaction (or vice versa) —
                                // that would mean replacing 1 record with 2 linked ones, or the reverse.
                                const locked = isEdit && (editIsTransfer ? o.id !== 'transfer' : o.id === 'transfer');
                                return (
                                    <button
                                        key={o.id}
                                        disabled={locked}
                                        onClick={() => selectType(o.id)}
                                        style={{
                                            flex: 1, border: 'none', borderRadius: 11, padding: '9px 0',
                                            cursor: locked ? 'default' : 'pointer',
                                            font: '600 13.5px var(--sans)',
                                            color: active ? '#fff' : 'var(--ink-muted)',
                                            background: active ? TYPE_ACCENT[o.id] : 'transparent',
                                            opacity: locked ? 0.4 : 1,
                                            transition: 'all .15s',
                                        }}
                                    >
                                        {o.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Amount display ── */}
                    <div style={{ padding: '18px 22px 4px', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                            {/* left spacer balances right-side buttons */}
                            <div style={{ width: 52, flexShrink: 0 }} />

                            <div style={{
                                fontFamily: 'var(--serif)', fontSize: 52, lineHeight: 1, flex: 1, textAlign: 'center',
                                color: amountColor, fontVariantNumeric: 'tabular-nums', transition: 'color .15s',
                            }}>
                                {sign}{amountNum.toLocaleString('fr-FR')}
                                <span style={{ fontSize: 26, color: 'var(--ink-muted)', marginLeft: 6 }}>F</span>
                            </div>

                            {/* Backspace + clear-all */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 52, flexShrink: 0 }}>
                                {amount !== '0' && (
                                    <button
                                        onClick={handleBackspace}
                                        style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', cursor: 'pointer', color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Delete size={15} strokeWidth={1.8} />
                                    </button>
                                )}
                                {amount.length > 1 && (
                                    <button
                                        onClick={handleClearAmount}
                                        style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(180,98,63,0.3)', background: 'rgba(180,98,63,0.07)', cursor: 'pointer', color: 'var(--clay)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <X size={14} strokeWidth={2} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Scrollable middle ── */}
                    <div className="no-sb" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 0 4px' }}>

                        {isTransfer ? (
                            /* ── Virement ── */
                            <div style={{ padding: '0 22px' }}>
                                <div style={{ font: '500 12px var(--sans)', color: 'var(--ink-muted)', marginBottom: 10 }}>Depuis</div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {accounts.map(a => {
                                        const { color } = getAccountVisuals(a);
                                        return (
                                            <AccBtn key={a.id} account={{ ...a, color }} active={fromAccId === a.id} accent={accent}
                                                onClick={() => { if (toAccId === a.id) set('toAccId', fromAccId); set('fromAccId', a.id); }}
                                            />
                                        );
                                    })}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'center', margin: '14px 0' }}>
                                    <button
                                        onClick={swapAccounts}
                                        aria-label="Inverser les comptes"
                                        style={{ width: 38, height: 38, borderRadius: 12, border: '1px solid var(--line)', background: 'var(--surface)', color: accent, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(90deg)' }}
                                    >
                                        <ArrowLeftRight size={18} strokeWidth={2} />
                                    </button>
                                </div>

                                <div style={{ font: '500 12px var(--sans)', color: 'var(--ink-muted)', marginBottom: 10 }}>Vers</div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {accounts.map(a => {
                                        const { color } = getAccountVisuals(a);
                                        return (
                                            <AccBtn key={a.id} account={{ ...a, color }} active={toAccId === a.id} accent={accent}
                                                onClick={() => { if (fromAccId === a.id) set('fromAccId', toAccId); set('toAccId', a.id); }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            /* ── Dépense / Revenu ── */
                            <>
                                <div style={{ padding: '0 22px' }}>
                                    <div style={{ font: '500 12px var(--sans)', color: 'var(--ink-muted)', marginBottom: 10 }}>Catégorie</div>
                                </div>
                                <div className="no-sb" style={{ display: 'flex', gap: 9, overflowX: 'auto', padding: '0 22px 4px' }}>
                                    {cats.map(cat => {
                                        const { icon: CatIcon, color } = getCategoryVisuals(cat);
                                        const active = catId === cat.id;
                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => set('catId', cat.id)}
                                                style={{
                                                    flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                                                    padding: '8px 14px 8px 8px', borderRadius: 99,
                                                    border: '1px solid ' + (active ? hexA(color, 0.5) : 'var(--line)'),
                                                    background: active ? hexA(color, 0.1) : 'var(--surface)',
                                                    transition: 'all .15s',
                                                }}
                                            >
                                                <span style={{ width: 26, height: 26, borderRadius: 8, background: hexA(color, 0.16), color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <CatIcon size={15} strokeWidth={1.9} />
                                                </span>
                                                <span style={{ font: '550 13.5px var(--sans)', color: active ? 'var(--ink)' : 'var(--ink-soft)' }}>
                                                    {cat.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div style={{ padding: '18px 22px 0' }}>
                                    <div style={{ font: '500 12px var(--sans)', color: 'var(--ink-muted)', marginBottom: 10 }}>Compte</div>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {accounts.map(a => {
                                            const { color } = getAccountVisuals(a);
                                            return (
                                                <AccBtn key={a.id} account={{ ...a, color }} active={accId === a.id} accent={accent}
                                                    onClick={() => set('accId', a.id)}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Date & time — collapsible */}
                        <div style={{ padding: '14px 22px 0' }}>
                            <button
                                onClick={() => setDateExpanded(e => !e)}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: 7,
                                    border: 'none', background: 'none', cursor: 'pointer', padding: '8px 12px',
                                    borderRadius: 12, transition: 'background .12s',
                                }}
                                onPointerDown={e => e.currentTarget.style.background = 'rgba(60,52,38,0.05)'}
                                onPointerUp={e => e.currentTarget.style.background = 'none'}
                                onPointerLeave={e => e.currentTarget.style.background = 'none'}
                            >
                                <Calendar size={13} strokeWidth={1.9} style={{ color: 'var(--ink-muted)', flexShrink: 0 }} />
                                <span style={{ flex: 1, textAlign: 'left', font: '500 13px var(--sans)', color: 'var(--ink-soft)' }}>
                                    {date && isToday(date) ? "Aujourd'hui" : date?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) ?? 'Date'}
                                    {' · '}{time}
                                </span>
                                <ChevronDown
                                    size={14} strokeWidth={2}
                                    style={{ color: 'var(--ink-muted)', transform: dateExpanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
                                />
                            </button>

                            {dateExpanded && (
                                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                                    <div style={{ flex: 1.5, minWidth: 0 }}>
                                        <DatePicker
                                            value={date}
                                            onChange={d => set('date', d)}
                                            placeholder="Date"
                                            style={{ ...fieldStyle, width: '100%', padding: '0 10px 0 13px' }}
                                        />
                                    </div>
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={e => set('time', e.target.value)}
                                        style={{ ...fieldStyle, flex: 1, minWidth: 0 }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Note */}
                        <div style={{ padding: '14px 22px 8px' }}>
                            <input
                                value={note}
                                onChange={e => set('note', e.target.value)}
                                placeholder="Ajouter une note…"
                                style={{ ...fieldStyle, width: '100%', height: 46, font: '500 14px var(--sans)' }}
                            />
                        </div>
                    </div>

                    {/* ── Keypad + save ── */}
                    <div style={{ flexShrink: 0, padding: '6px 18px 0', borderTop: '1px solid var(--line)', background: 'var(--surface)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                            {KEYS.map(k => (
                                <button
                                    key={k}
                                    onPointerDown={e => { pressKey(k); e.currentTarget.style.background = 'rgba(60,52,38,0.06)'; }}
                                    onPointerUp={e => { e.currentTarget.style.background = 'none'; }}
                                    onPointerLeave={e => { e.currentTarget.style.background = 'none'; }}
                                    style={{
                                        height: 48, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 12,
                                        fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--ink)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'background .08s',
                                    }}
                                >
                                    {k}
                                </button>
                            ))}
                        </div>

                        <button
                            disabled={!canSave}
                            onClick={handleSave}
                            style={{
                                width: '100%', height: 54, marginTop: 6, borderRadius: 16, border: 'none',
                                cursor: canSave ? 'pointer' : 'default',
                                background: canSave ? 'var(--pine)' : 'rgba(60,52,38,0.10)',
                                color: canSave ? '#fff' : 'var(--ink-muted)',
                                font: '650 15.5px var(--sans)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                boxShadow: canSave ? '0 8px 20px rgba(44,84,72,0.28)' : 'none',
                                transition: 'all .2s',
                            }}
                        >
                            {isTransfer
                                ? <><ArrowLeftRight size={19} strokeWidth={2.2} /> {isEdit ? 'Modifier le virement' : 'Effectuer le virement'}</>
                                : <><Check size={19} strokeWidth={2.2} /> Enregistrer</>
                            }
                        </button>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
