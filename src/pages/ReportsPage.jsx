import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, Flame, PiggyBank } from "lucide-react";
import { format, addMonths, subMonths, isSameMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { useMonthlyReportData } from "@/utils/db/hooks";
import { useEnrichedTransactions } from "@/utils/db/hooks/transactions/useEnrichedTransactions";
import { GlyphChip } from "@/components/ui/glyph-chip";
import { getCategoryVisuals } from "@/utils/ui/iconMap";

// ── Helpers ───────────────────────────────────────────────────────────────

function formatCFA(n, { compact = false } = {}) {
    const v = Math.round(Math.abs(n));
    let body;
    if (compact && v >= 1000000) {
        body = (v / 1000000).toFixed(v % 1000000 === 0 ? 0 : 1).replace('.', ',') + ' M';
    } else {
        body = v.toLocaleString('fr-FR');
    }
    return `${n < 0 ? '−' : ''}${body} F`;
}

function hexA(hex, alpha) {
    const h = hex.replace('#', '');
    const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
    return `rgba(${r},${g},${b},${alpha})`;
}

function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const DAYS_SHORT = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];

function dailySeries(transactions) {
    const today = new Date();
    const days = [];
    for (let d = 6; d >= 0; d--) {
        const dt = new Date(today);
        dt.setDate(dt.getDate() - d);
        days.push({ date: dt, label: DAYS_SHORT[dt.getDay()][0].toUpperCase(), income: 0, expense: 0 });
    }
    transactions.forEach(t => {
        if (t.isTransfer) return;
        const slot = days.find(x => sameDay(x.date, t.date));
        if (!slot) return;
        if (t.isIncome) slot.income += Math.abs(t.amount);
        else slot.expense += Math.abs(t.amount);
    });
    return days;
}

function savingsMessage(rate) {
    if (rate >= 20) return `Vous gardez ${rate.toFixed(0)}% de vos revenus. Joli rythme.`;
    if (rate >= 0) return `Vous gardez ${rate.toFixed(0)}% de vos revenus ce mois-ci.`;
    return 'Vos dépenses dépassent vos revenus ce mois-ci.';
}

// ── Sub-components ────────────────────────────────────────────────────────

function MonthSwitcher({ label, onPrev, onNext, nextDisabled }) {
    const navBtn = (Icon, onClick, aria, disabled) => (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={aria}
            style={{
                width: 38, height: 38, borderRadius: 12, border: '1px solid var(--line)',
                background: 'var(--surface)', color: 'var(--ink-soft)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.35 : 1,
            }}
        >
            <Icon size={18} strokeWidth={1.9} />
        </button>
    );
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {navBtn(ChevronLeft, onPrev, 'Mois précédent', false)}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={17} strokeWidth={1.8} style={{ color: 'var(--pine)' }} />
                <span style={{ fontFamily: 'var(--serif)', fontSize: 21, color: 'var(--ink)' }}>{label}</span>
            </div>
            {navBtn(ChevronRight, onNext, 'Mois suivant', nextDisabled)}
        </div>
    );
}

function SectionLabel({ children }) {
    return (
        <h3 style={{ font: '500 15px/1 var(--sans)', letterSpacing: 0.1, color: 'var(--ink-soft)', margin: '0 0 12px' }}>
            {children}
        </h3>
    );
}

function Ring({ pct, size = 116, stroke = 11, color = 'var(--pine)' }) {
    const r = (size - stroke) / 2;
    const C = 2 * Math.PI * r;
    const off = C * (1 - Math.max(0, Math.min(pct, 100)) / 100);
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(244,241,232,0.16)" strokeWidth={stroke} />
            <circle
                cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                strokeDasharray={C} strokeDashoffset={off} strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)' }}
            />
        </svg>
    );
}

function MiniBars({ data, max, height = 132 }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height, padding: '0 2px' }}>
            {data.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: '100%', width: '100%', justifyContent: 'center' }}>
                        <div style={{ width: 7, height: `${(d.income / max) * 100}%`, minHeight: d.income ? 4 : 0, borderRadius: 4, background: 'var(--pine)' }} />
                        <div style={{ width: 7, height: `${(d.expense / max) * 100}%`, minHeight: d.expense ? 4 : 0, borderRadius: 4, background: hexA('#b4623f', 0.55) }} />
                    </div>
                    <span style={{ font: '500 10px var(--sans)', color: 'var(--ink-muted)' }}>{d.label}</span>
                </div>
            ))}
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function ReportsPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const data = useMonthlyReportData(selectedDate);
    const allTransactions = useEnrichedTransactions();
    const [showLoading, setShowLoading] = useState(false);

    useEffect(() => {
        if (!data) {
            const t = setTimeout(() => setShowLoading(true), 200);
            return () => clearTimeout(t);
        }
    }, [data]);

    const isCurrentMonth = isSameMonth(selectedDate, new Date());

    const handlePrevMonth = () => setSelectedDate(prev => subMonths(prev, 1));
    const handleNextMonth = () => {
        if (isCurrentMonth) return;
        setSelectedDate(prev => addMonths(prev, 1));
    };

    const days = useMemo(() => dailySeries(allTransactions), [allTransactions]);
    const maxDay = Math.max(...days.map(d => Math.max(d.income, d.expense)), 1);

    if (data?.isError) return (
        <div style={{
            display: 'flex', height: '100dvh', alignItems: 'center', justifyContent: 'center',
            padding: 32, textAlign: 'center', flexDirection: 'column', gap: 16, background: 'var(--paper)',
        }}>
            <div style={{ color: 'var(--clay)', font: '700 15px var(--sans)' }}>
                Erreur de lecture de la base de données
            </div>
            <button
                onClick={() => window.location.reload()}
                style={{
                    padding: '10px 24px', borderRadius: 12, background: 'var(--pine)',
                    color: '#fff', border: 'none', cursor: 'pointer', font: '600 14px var(--sans)',
                }}
            >
                Réessayer
            </button>
        </div>
    );

    if (!data || !data.isLoaded) {
        if (!showLoading) return <div style={{ height: '100dvh', background: 'var(--paper)' }} />;
        return (
            <div style={{ display: 'flex', height: '100dvh', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)' }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    const { summary, topExpenseCategories } = data;
    const rawMonthLabel = format(selectedDate, 'MMMM yyyy', { locale: fr });
    const monthLabel = rawMonthLabel.charAt(0).toUpperCase() + rawMonthLabel.slice(1);

    return (
        <div
            className="no-sb"
            style={{ overflowY: 'auto', background: 'var(--paper)', minHeight: '100dvh' }}
        >
            <div style={{ padding: '0 20px 124px' }}>

                {/* Header */}
                <div style={{
                    padding: '8px 0 16px',
                    paddingTop: 'max(8px, calc(env(safe-area-inset-top) + 8px))',
                }}>
                    <h1 style={{
                        fontFamily: 'var(--serif)', fontSize: 34, color: 'var(--ink)',
                        margin: 0, lineHeight: 1,
                    }}>
                        Rapports
                    </h1>
                    <div style={{ font: '480 13px var(--sans)', color: 'var(--ink-muted)', marginTop: 6 }}>
                        Votre santé financière
                    </div>
                </div>

                {/* Month switcher */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, padding: '10px 12px', marginBottom: 18 }}>
                    <MonthSwitcher label={monthLabel} onPrev={handlePrevMonth} onNext={handleNextMonth} nextDisabled={isCurrentMonth} />
                </div>

                {/* Savings hero */}
                <div style={{
                    background: 'linear-gradient(150deg, #2f4f46, #213832)', borderRadius: 26, padding: 22,
                    color: '#f4f1e8', display: 'flex', alignItems: 'center', gap: 20,
                    boxShadow: '0 16px 36px rgba(31,52,46,0.28)',
                }}>
                    <div style={{ position: 'relative', width: 116, height: 116, flexShrink: 0 }}>
                        <Ring pct={summary.savingsRate} color="#bcd29a" />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontFamily: 'var(--serif)', fontSize: 30, lineHeight: 1 }}>{summary.savingsRate.toFixed(0)}%</span>
                            <span style={{ font: '500 10px var(--sans)', color: 'rgba(244,241,232,0.6)', marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.6 }}>épargne</span>
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ font: '500 12.5px var(--sans)', color: 'rgba(244,241,232,0.7)' }}>Épargne nette du mois</div>
                        <div style={{ fontFamily: 'var(--serif)', fontSize: 32, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>{formatCFA(summary.netSavings)}</div>
                        <div style={{ font: '460 12.5px var(--sans)', color: 'rgba(244,241,232,0.62)', marginTop: 8, lineHeight: 1.4 }}>
                            {savingsMessage(summary.savingsRate)}
                        </div>
                    </div>
                </div>

                {/* Tiles */}
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    {[
                        { label: 'Revenus', value: summary.totalIncome, color: '#3f6f63', Icon: TrendingUp },
                        { label: 'Dépenses', value: summary.totalExpenses, color: '#b4623f', Icon: Flame },
                        { label: 'Épargne', value: summary.netSavings, color: '#b08a4f', Icon: PiggyBank },
                    ].map(t => (
                        <div key={t.label} style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, padding: '13px 12px' }}>
                            <span style={{
                                width: 26, height: 26, borderRadius: 9, background: hexA(t.color, 0.13), color: t.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <t.Icon size={15} strokeWidth={1.9} />
                            </span>
                            <div style={{ font: '480 11px var(--sans)', color: 'var(--ink-muted)', marginTop: 11 }}>{t.label}</div>
                            <div style={{ fontFamily: 'var(--serif)', fontSize: 17, color: 'var(--ink)', marginTop: 2, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                                {formatCFA(t.value, { compact: true })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Activity */}
                <div style={{ marginTop: 28 }}>
                    <SectionLabel>Activité — 7 derniers jours</SectionLabel>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 22, padding: '20px 18px 16px' }}>
                        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: '500 12px var(--sans)', color: 'var(--ink-soft)' }}>
                                <span style={{ width: 9, height: 9, borderRadius: 3, background: 'var(--pine)' }} />Revenus
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: '500 12px var(--sans)', color: 'var(--ink-soft)' }}>
                                <span style={{ width: 9, height: 9, borderRadius: 3, background: hexA('#b4623f', 0.55) }} />Dépenses
                            </span>
                        </div>
                        <MiniBars data={days} max={maxDay} />
                    </div>
                </div>

                {/* Breakdown */}
                <div style={{ marginTop: 28 }}>
                    <SectionLabel>Où est passé mon argent ?</SectionLabel>
                    {topExpenseCategories.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ink-muted)', font: '460 13px var(--sans)' }}>
                            Aucune dépense ce mois-ci
                        </div>
                    ) : (
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 22, padding: '6px 18px' }}>
                            {topExpenseCategories.map((b, i) => {
                                const { icon, color } = getCategoryVisuals(b.category);
                                return (
                                    <div key={b.category?.id ?? b.name} style={{ padding: '15px 0', borderTop: i ? '1px solid var(--line)' : 'none' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                                            <GlyphChip icon={icon} color={color} size={34} radius={11} soft={0.14} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ font: '600 14px var(--sans)', color: 'var(--ink)' }}>{b.name}</div>
                                                <div style={{ font: '470 11.5px var(--sans)', color: 'var(--ink-muted)', marginTop: 1 }}>
                                                    {b.count} opération{b.count > 1 ? 's' : ''}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ font: '650 14px var(--sans)', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{formatCFA(b.total)}</div>
                                                <div style={{ font: '500 11px var(--sans)', color: 'var(--ink-muted)' }}>{b.pct.toFixed(0)}%</div>
                                            </div>
                                        </div>
                                        <div style={{ width: '100%', height: 6, borderRadius: 99, background: 'rgba(60,52,38,0.07)', overflow: 'hidden' }}>
                                            <div style={{ width: `${b.pct}%`, height: '100%', borderRadius: 99, background: color, opacity: 0.85 }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
