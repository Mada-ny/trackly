import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Bell, Eye, EyeOff, TrendingUp, TrendingDown, ChevronRight, Plus } from "lucide-react";
import { format } from "date-fns";
import { useDashboardData, useSettings } from "@/utils/db/hooks";
import { GlyphChip } from "@/components/ui/glyph-chip";
import { getCategoryVisuals, getAccountVisuals } from "@/utils/ui/iconMap";

// ── Helpers ──────────────────────────────────────────────────────────────

function formatCFA(n, { sign = false } = {}) {
    const v = Math.round(Math.abs(n));
    const body = v.toLocaleString('fr-FR');
    const prefix = sign ? (n < 0 ? '−' : '+') : (n < 0 ? '−' : '');
    return `${prefix}${body} F`;
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
}

const ACCOUNT_KIND = {
    'Espèces': 'Liquide',
    'Carte Djamo': 'Carte',
    'Wave': 'Mobile',
    'Mobile Money': 'Mobile',
};

// ── Sub-components ────────────────────────────────────────────────────────

function Sparkline({ points }) {
    if (!points || points.length < 2) return null;
    const W = 320, H = 44;
    const max = Math.max(...points), min = Math.min(...points);
    const span = max - min || 1;
    const step = W / (points.length - 1);
    const pts = points
        .map((p, i) => `${i * step},${H - ((p - min) / span) * (H - 6) - 3}`)
        .join(' ');
    const lx = (points.length - 1) * step;
    const ly = H - ((points[points.length - 1] - min) / span) * (H - 6) - 3;
    return (
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
            <polyline points={pts} fill="none" stroke="rgba(255,253,248,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={lx} cy={ly} r="3" fill="#fff" />
        </svg>
    );
}

function HeroCard({ balance, metrics, hidden, onToggle, dailyTrend }) {
    const savings = metrics.income > 0
        ? Math.round(((metrics.income - metrics.expenses) / metrics.income) * 100)
        : 0;

    return (
        <div style={{
            position: 'relative', overflow: 'hidden', borderRadius: 28,
            background: 'linear-gradient(155deg, #2f4f46 0%, #233b34 58%, #1d322c 100%)',
            color: '#f4f1e8', padding: '22px 22px 18px',
            boxShadow: '0 18px 40px rgba(31,52,46,0.32)',
        }}>
            <div style={{
                position: 'absolute', top: -60, right: -40, width: 200, height: 200,
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(180,200,160,0.18), transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ font: '500 12.5px var(--sans)', letterSpacing: 0.3, color: 'rgba(244,241,232,0.7)' }}>
                        Solde total
                    </span>
                    <button
                        onClick={onToggle}
                        aria-label={hidden ? 'Afficher le solde' : 'Masquer le solde'}
                        style={{
                            border: 'none', background: 'rgba(255,255,255,0.12)', color: '#f4f1e8',
                            width: 30, height: 30, borderRadius: 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}
                    >
                        {hidden ? <Eye size={16} strokeWidth={1.8} /> : <EyeOff size={16} strokeWidth={1.8} />}
                    </button>
                </div>
                <div style={{
                    fontFamily: 'var(--serif)', fontSize: 46, lineHeight: 1.05,
                    letterSpacing: 0.5, marginTop: 10, fontVariantNumeric: 'tabular-nums',
                }}>
                    {hidden ? '••• ••• F' : formatCFA(balance)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                        background: 'rgba(180,200,160,0.2)', color: '#dfe7cc',
                        font: '600 12px var(--sans)', padding: '4px 9px', borderRadius: 99,
                    }}>
                        <TrendingUp size={13} strokeWidth={2.1} />
                        {savings}%
                    </span>
                    <span style={{ font: '460 12px var(--sans)', color: 'rgba(244,241,232,0.62)' }}>
                        ce mois‑ci
                    </span>
                </div>
                <div style={{ marginTop: 14, opacity: 0.85 }}>
                    <Sparkline points={dailyTrend} />
                </div>
            </div>
        </div>
    );
}

function AccountStrip({ accounts, onManage, hidden }) {
    return (
        <div
            className="no-sb"
            style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '2px 20px 4px', margin: '0 -20px' }}
        >
            {accounts.map(acc => {
                const { icon, color } = getAccountVisuals(acc);
                return (
                    <div key={acc.id} style={{
                        flexShrink: 0, width: 156, background: 'var(--surface)',
                        border: '1px solid var(--line)', borderRadius: 20, padding: '15px 15px 14px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <GlyphChip icon={icon} color={color} size={36} radius={11} soft={0.14} />
                            <span style={{
                                font: '500 10.5px var(--sans)', color: 'var(--ink-muted)',
                                textTransform: 'uppercase', letterSpacing: 0.6,
                            }}>
                                {ACCOUNT_KIND[acc.name] || 'Compte'}
                            </span>
                        </div>
                        <div style={{ font: '550 13px var(--sans)', color: 'var(--ink-soft)', marginTop: 13 }}>
                            {acc.name}
                        </div>
                        <div style={{
                            fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--ink)',
                            marginTop: 2, fontVariantNumeric: 'tabular-nums',
                        }}>
                            {hidden ? '••• ••• F' : formatCFA(acc.balance)}
                        </div>
                    </div>
                );
            })}
            <button
                onClick={onManage}
                style={{
                    flexShrink: 0, width: 92, background: 'none',
                    border: '1px dashed var(--line)', borderRadius: 20,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', gap: 8, color: 'var(--ink-muted)', cursor: 'pointer',
                }}
            >
                <span style={{
                    width: 34, height: 34, borderRadius: 11, background: 'rgba(63,111,99,0.10)',
                    color: 'var(--pine)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Plus size={18} strokeWidth={2} />
                </span>
                <span style={{ font: '500 11px var(--sans)' }}>Gérer</span>
            </button>
        </div>
    );
}

function StatTile({ label, value, income, delta }) {
    const accent = income ? '#3f6f63' : '#b4623f';
    const up = delta >= 0;
    return (
        <div style={{
            flex: 1, background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: 22, padding: '16px 16px 15px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                <span style={{
                    width: 26, height: 26, borderRadius: 9,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: income ? 'rgba(63,111,99,0.13)' : 'rgba(180,98,63,0.13)',
                    color: accent,
                }}>
                    {income
                        ? <TrendingUp size={15} strokeWidth={1.9} />
                        : <TrendingDown size={15} strokeWidth={1.9} />
                    }
                </span>
                <span style={{ font: '500 12.5px var(--sans)', color: 'var(--ink-soft)' }}>{label}</span>
            </div>
            <div style={{
                fontFamily: 'var(--serif)', fontSize: 27, color: 'var(--ink)',
                letterSpacing: 0.2, lineHeight: 1,
            }}>
                {formatCFA(value)}
            </div>
            {delta != null && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 4, marginTop: 9,
                    font: '550 11.5px var(--sans)',
                    color: up ? 'var(--pine)' : 'var(--clay)',
                }}>
                    {up ? <TrendingUp size={13} strokeWidth={2} /> : <TrendingDown size={13} strokeWidth={2} />}
                    {Math.abs(delta).toFixed(1)}%
                    <span style={{ color: 'var(--ink-muted)', fontWeight: 460, marginLeft: 2 }}>
                        vs {new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toLocaleDateString('fr-FR', { month: 'long' })}
                    </span>
                </div>
            )}
        </div>
    );
}

function ProgressBar({ pct }) {
    const danger = pct > 90, warn = pct > 72;
    const color = danger ? 'var(--clay)' : warn ? '#c79a52' : 'var(--pine)';
    return (
        <div style={{ width: '100%', height: 8, borderRadius: 99, background: 'rgba(60,52,38,0.08)', overflow: 'hidden' }}>
            <div style={{
                width: `${Math.min(pct, 100)}%`, height: '100%', borderRadius: 99,
                background: color, transition: 'width .8s cubic-bezier(.22,1,.36,1)',
            }} />
        </div>
    );
}

function SectionLabel({ children, to, label }) {
    return (
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ font: '500 15px/1 var(--sans)', letterSpacing: 0.1, color: 'var(--ink-soft)', margin: 0 }}>
                {children}
            </h3>
            {to && (
                <Link to={to} style={{
                    font: '550 13px var(--sans)', color: 'var(--pine)',
                    display: 'flex', alignItems: 'center', gap: 2, textDecoration: 'none',
                }}>
                    {label}
                    <ChevronRight size={13} strokeWidth={2} />
                </Link>
            )}
        </div>
    );
}

function TxRow({ tx, showBorder, onClick }) {
    const { icon, color } = tx.isTransfer ? { icon: getAccountVisuals(tx.account).icon, color: '#8a8170' } : getCategoryVisuals(tx.category);
    const timeStr = tx.date ? format(new Date(tx.date), 'HH:mm') : '';
    const signed = tx.isIncome ? tx.amount : -Math.abs(tx.amount);

    return (
        <button
            onClick={() => onClick && onClick(tx)}
            style={{
                width: '100%', border: 'none', background: 'none', cursor: 'pointer',
                borderTop: showBorder ? '1px solid var(--line)' : 'none',
                display: 'flex', alignItems: 'center', gap: 13, padding: '11px 4px', textAlign: 'left',
                borderRadius: 14,
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

export default function DashboardPage() {
    const data = useDashboardData();
    const settings = useSettings();
    const navigate = useNavigate();
    const [hidden, setHidden] = useState(false);
    const [showLoading, setShowLoading] = useState(false);

    useEffect(() => {
        if (!data) {
            const t = setTimeout(() => setShowLoading(true), 200);
            return () => clearTimeout(t);
        }
    }, [data]);

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

    const { totalBalance, globalMetrics, accountMetrics, recentTransactions, budgets, dailyChart } = data;
    const recents = recentTransactions.slice(0, 4);

    return (
        <div
            className="no-sb"
            style={{ overflowY: 'auto', background: 'var(--paper)', minHeight: '100dvh' }}
        >
            <div style={{ padding: '0 20px 124px' }}>

                {/* Greeting */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 0 18px',
                    paddingTop: 'max(8px, calc(env(safe-area-inset-top) + 8px))',
                }}>
                    <div>
                        <div style={{ font: '480 13px var(--sans)', color: 'var(--ink-muted)' }}>
                            {getGreeting()},
                        </div>
                        <div style={{
                            fontFamily: 'var(--serif)', fontSize: 27, color: 'var(--ink)',
                            lineHeight: 1.05,
                        }}>
                            {settings?.userName || 'Mes finances'}
                        </div>
                    </div>
                    <button
                        aria-label="Notifications"
                        style={{
                            position: 'relative', width: 44, height: 44, borderRadius: 14,
                            border: '1px solid var(--line)', background: 'var(--surface)',
                            color: 'var(--ink-soft)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', cursor: 'pointer',
                        }}
                    >
                        <Bell size={20} strokeWidth={1.7} />
                        <span style={{
                            position: 'absolute', top: 11, right: 12,
                            width: 7, height: 7, borderRadius: 99,
                            background: 'var(--clay)', border: '1.5px solid var(--surface)',
                        }} />
                    </button>
                </div>

                {/* Hero balance */}
                <HeroCard
                    balance={totalBalance}
                    metrics={globalMetrics}
                    hidden={hidden}
                    onToggle={() => setHidden(h => !h)}
                    dailyTrend={dailyChart.trend}
                />

                {/* Account strip */}
                <div style={{ marginTop: 24 }}>
                    <SectionLabel>Mes comptes</SectionLabel>
                    <AccountStrip accounts={accountMetrics} onManage={() => navigate('/settings')} hidden={hidden} />
                </div>

                {/* This month stats */}
                <div style={{ marginTop: 26 }}>
                    <SectionLabel to="/reports" label="Rapports">Ce mois‑ci</SectionLabel>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <StatTile
                            label="Revenus"
                            value={globalMetrics.income}
                            income
                            delta={globalMetrics.comparison.incomeVar}
                        />
                        <StatTile
                            label="Dépenses"
                            value={globalMetrics.expenses}
                            delta={globalMetrics.comparison.expenseVar}
                        />
                    </div>
                </div>

                {/* Budget objectives */}
                {budgets.length > 0 && (
                    <div style={{ marginTop: 26 }}>
                        <SectionLabel to="/reports" label="Voir tout">Objectifs</SectionLabel>
                        <div style={{
                            background: 'var(--surface)', border: '1px solid var(--line)',
                            borderRadius: 22, padding: '6px 18px',
                        }}>
                            {budgets.map((b, i) => (
                                <div key={b.id} style={{ padding: '15px 0', borderTop: i ? '1px solid var(--line)' : 'none' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{
                                                width: 9, height: 9, borderRadius: 99,
                                                background: b.percentage > 90 ? 'var(--clay)' : b.percentage > 72 ? '#c79a52' : 'var(--pine)',
                                            }} />
                                            <span style={{ font: '600 14px var(--sans)', color: 'var(--ink)' }}>{b.name}</span>
                                        </div>
                                        <span style={{ font: '480 12.5px var(--sans)', color: 'var(--ink-muted)', fontVariantNumeric: 'tabular-nums' }}>
                                            {formatCFA(b.spent)} <span style={{ opacity: 0.6 }}>/ {formatCFA(b.monthlyLimit)}</span>
                                        </span>
                                    </div>
                                    <ProgressBar pct={b.percentage} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent activity */}
                <div style={{ marginTop: 26 }}>
                    <SectionLabel to="/transactions" label="Tout voir">Activité récente</SectionLabel>
                    {recents.length > 0 ? (
                        <div style={{
                            background: 'var(--surface)', border: '1px solid var(--line)',
                            borderRadius: 22, padding: '4px 14px',
                        }}>
                            {recents.map((t, i) => (
                                <TxRow key={t.id} tx={t} showBorder={i > 0} onClick={() => navigate('/transactions')} />
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            background: 'var(--surface)', border: '1px solid var(--line)',
                            borderRadius: 22, padding: '32px 20px', textAlign: 'center',
                        }}>
                            <div style={{ font: '600 14px var(--sans)', color: 'var(--ink-soft)', marginBottom: 4 }}>
                                Aucune transaction récente
                            </div>
                            <div style={{ font: '460 12px var(--sans)', color: 'var(--ink-muted)', marginBottom: 16 }}>
                                Ajoutez votre première transaction pour commencer
                            </div>
                            <button
                                onClick={() => navigate('/transactions/new')}
                                style={{
                                    padding: '10px 24px', borderRadius: 99, background: 'var(--pine)',
                                    color: '#fff', border: 'none', cursor: 'pointer', font: '600 13px var(--sans)',
                                }}
                            >
                                Nouvelle transaction
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
