import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    WalletCards, 
    TrendingUp, 
    TrendingDown, 
    ArrowUpRight, 
    ArrowDownRight,
    PieChart as PieIcon,
    BarChart3,
    ChevronRight,
    History,
    Layers,
    Plus,
    ArrowRightLeft,
    Calendar,
    Target,
    Activity
} from "lucide-react";
import { useDashboardData } from "@/utils/db/hooks";
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    Title, 
    Tooltip, 
    Legend, 
    ArcElement,
    PointElement,
    LineElement,
    LineController,
    BarController,
    Filler
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/utils/number/CurrencyProvider";
import { AmountDisplay } from "@/components/ui/amount-display";
import { FAB } from "@/components/ui/FAB";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    LineController,
    BarController,
    Filler
);

export default function DashboardPage() {
    const data = useDashboardData();
    const [activeIndex, setActiveIndex] = useState(0); 
    const carouselRef = useRef(null);
    const navigate = useNavigate();
    const { formatCurrency } = useCurrency();
    const [showLoading, setShowLoading] = useState(false);

    // Éviter le flicker pour les chargements rapides
    useEffect(() => {
        if (!data) {
            const timer = setTimeout(() => setShowLoading(true), 200);
            return () => clearTimeout(timer);
        }
    }, [data]);

    // Gestion des erreurs
    if (data?.isError) return (
        <div className="flex h-screen items-center justify-center p-8 text-center flex-col gap-4">
            <div className="text-destructive font-bold">Erreur lors de la lecture de la base de données</div>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
    );

    // État de chargement discret
    if (!data || !data.isLoaded) {
        if (!showLoading) return <div className="h-screen bg-background" />;
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    const { 
        totalBalance, globalMetrics, todayStats, weekStats, budgets,
        accountMetrics, recentTransactions, dailyChart, categoryChart 
    } = data;

    const currentMetrics = activeIndex === 0 
        ? globalMetrics 
        : accountMetrics[activeIndex - 1];

    const handleScroll = () => {
        const container = carouselRef.current;
        if (!container) return;
        const scrollLeft = container.scrollLeft;
        const firstChild = container.firstElementChild;
        if (!firstChild) return;
        const itemWidth = firstChild.offsetWidth;
        const gap = 16;
        const newIndex = Math.round(scrollLeft / (itemWidth + gap));
        if (newIndex !== activeIndex && newIndex >= 0 && newIndex <= (accountMetrics?.length || 0)) {
            setActiveIndex(newIndex);
        }
    };

    const mixedChartData = {
        labels: dailyChart.labels,
        datasets: [
            {
                type: 'line',
                label: 'Solde cumulé',
                data: dailyChart.trend,
                borderColor: 'oklch(0.45 0.04 155)',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                tension: 0.4,
                fill: true,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                    gradient.addColorStop(0, 'rgba(6, 95, 70, 0.1)');
                    gradient.addColorStop(1, 'rgba(6, 95, 70, 0)');
                    return gradient;
                },
                yAxisID: 'y1',
            },
            {
                type: 'bar',
                label: 'Revenus',
                data: dailyChart.income,
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                borderRadius: 4,
                maxBarThickness: 8,
                yAxisID: 'y',
            },
            {
                type: 'bar',
                label: 'Dépenses',
                data: dailyChart.expenses,
                backgroundColor: 'rgba(239, 68, 68, 0.5)',
                borderRadius: 4,
                maxBarThickness: 8,
                yAxisID: 'y',
            }
        ]
    };

    const doughnutData = {
        labels: categoryChart.labels,
        datasets: [{
            data: categoryChart.datasets,
            backgroundColor: [
                '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'
            ],
            borderWidth: 2,
            borderColor: 'transparent',
            hoverOffset: 8
        }]
    };

    const hasChartData = dailyChart.income.some(v => v > 0) || dailyChart.expenses.some(v => v > 0);
    const hasCategoryData = categoryChart.datasets.length > 0 && categoryChart.datasets.some(v => v > 0);

    return (
        <div className="flex flex-col h-screen bg-background">
            <div className="shrink-0 glass-header border-b border-border/50 sticky top-0 z-30">
                <div className="px-4 pt-6 pb-4 space-y-2">
                    <h1 className="text-2xl font-black tracking-tight text-foreground">
                        Tableau de bord
                    </h1>
                    <p className="text-xs font-medium text-muted-foreground">
                        Aperçu de vos finances
                    </p>
                </div>
            </div>

            <div className="grow overflow-y-auto no-scrollbar">
                <div className="p-4 pb-24 space-y-6 max-w-4xl mx-auto">
                    
                    {/* Carrousel de comptes */}
                    <section className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Mes Comptes</h2>
                            <div className="flex gap-1.5">
                                {Array.from({ length: (accountMetrics?.length || 0) + 1 }).map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={cn(
                                            "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                            activeIndex === i ? "w-4 bg-primary" : "bg-muted-foreground/20"
                                        )} 
                                    />
                                ))}
                            </div>
                        </div>
                        
                        <div 
                            ref={carouselRef}
                            onScroll={handleScroll}
                            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar px-4 -mx-4"
                        >
                            <TotalBalanceCard balance={totalBalance} />

                            {accountMetrics?.map(acc => (
                                <AccountBalanceCard key={acc.id} account={acc} />
                            ))}
                        </div>
                    </section>

                    {/* Statistiques dynamiques (teintées) */}
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <MetricCard 
                            title="Revenus du mois" 
                            amount={currentMetrics.income} 
                            variance={currentMetrics.comparison.incomeVar} 
                            icon={<TrendingUp className="h-4 w-4" />}
                            color="emerald"
                            className="bg-emerald-500/5 dark:bg-emerald-500/3 border-emerald-500/10 shadow-emerald-500/5"
                            key={`income-${activeIndex}`} 
                        />

                        <MetricCard 
                            title="Dépenses du mois" 
                            amount={currentMetrics.expenses} 
                            variance={currentMetrics.comparison.expenseVar} 
                            icon={<TrendingDown className="h-4 w-4" />}
                            color="red"
                            inverse
                            className="bg-red-500/5 dark:bg-red-500/3 border-red-500/10 shadow-red-500/5"
                            key={`expense-${activeIndex}`}
                        />
                    </div>

                    {/* Statistiques rapides (Aujourd'hui & Semaine) */}
                    {activeIndex === 0 && (
                        <div className="grid grid-cols-2 gap-4">
                            <QuickStatsCard title="Aujourd'hui" expenses={todayStats.expenses} income={todayStats.income} />
                            <QuickStatsCard title="Cette semaine" expenses={weekStats.expenses} income={weekStats.income} />
                        </div>
                    )}

                    {/* Section graphiques (Analyses hybrides) */}
                    <div className="grid gap-4 md:grid-cols-6">
                        <Card className="md:col-span-4 bg-white/60 dark:bg-white/2 backdrop-blur-md border-border/50 shadow-sm rounded-3xl overflow-hidden flex flex-col transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between pb-4">
                                <div>
                                    <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-primary" />
                                        Santé Financière
                                    </CardTitle>
                                    <CardDescription className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Activité & Tendance du solde</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="h-60 flex items-center justify-center grow px-2">
                                {hasChartData ? (
                                    <Bar 
                                        data={mixedChartData} 
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { 
                                                legend: { display: false },
                                                tooltip: {
                                                    mode: 'index',
                                                    intersect: false,
                                                    padding: 10,
                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                    titleColor: '#1f2937',
                                                    bodyColor: '#4b5563',
                                                    borderColor: 'rgba(0,0,0,0.1)',
                                                    borderWidth: 1,
                                                    displayColors: true,
                                                    boxPadding: 4
                                                }
                                            },
                                            scales: {
                                                x: { grid: { display: false }, ticks: { font: { size: 9, weight: 'bold' }, color: 'oklch(0.45 0.04 155)' } },
                                                y: { 
                                                    id: 'y',
                                                    position: 'left',
                                                    grid: { color: 'rgba(0,0,0,0.02)' }, 
                                                    ticks: { display: false } 
                                                },
                                                y1: {
                                                    id: 'y1',
                                                    position: 'right',
                                                    grid: { display: false },
                                                    ticks: { display: false }
                                                }
                                            }
                                        }} 
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-4 py-8 opacity-40">
                                        <BarChart3 className="w-12 h-12 text-muted-foreground/20" />
                                        <div className="text-center space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">En attente de flux</p>
                                            <p className="text-[9px] text-muted-foreground/60 italic">L'analyse d'activité s'affichera ici</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2 bg-white/60 dark:bg-white/2 backdrop-blur-md border-border/50 shadow-sm rounded-3xl overflow-hidden flex flex-col transition-all duration-300">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                    <PieIcon className="w-4 h-4 text-primary" />
                                    Répartition
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center grow pt-0 min-h-[200px]">
                                {hasCategoryData ? (
                                    <>
                                        <div className="h-[140px] w-full">
                                            <Doughnut 
                                                data={doughnutData} 
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: { legend: { display: false } },
                                                    cutout: '78%'
                                                }} 
                                            />
                                        </div>
                                        <div className="mt-6 w-full space-y-2 px-2 pb-2">
                                            {categoryChart.labels.map((label, i) => (
                                                <div key={label} className="flex items-center justify-between text-[9px] font-black">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: doughnutData.datasets[0].backgroundColor[i] }} />
                                                        <span className="truncate max-w-[75px] uppercase tracking-tighter opacity-80">{label}</span>
                                                    </div>
                                                    <span className="text-muted-foreground tabular-nums">{formatCurrency(categoryChart.datasets[i])}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 py-8 grow justify-center opacity-40">
                                        <PieIcon className="w-12 h-12 text-muted-foreground/20" />
                                        <div className="text-center px-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Aucune dépense</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Transactions récentes */}
                    <Card className="bg-white/60 dark:bg-white/2 backdrop-blur-md border-border/50 overflow-hidden shadow-sm rounded-3xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/10 border-b border-border/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                    <History className="w-4.5 h-4.5" />
                                </div>
                                <CardTitle className="text-sm font-black uppercase tracking-tight">Dernières opérations</CardTitle>
                            </div>
                            <Link to="/transactions" className="text-[10px] font-black text-primary hover:underline flex items-center gap-1 uppercase tracking-tighter">
                                Tout voir <ChevronRight className="w-3 h-3" />
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recentTransactions.length > 0 ? (
                                <div className="divide-y divide-border/10">
                                    {recentTransactions?.map(t => (
                                        <div key={t.id} className="flex items-center justify-between p-4 active:bg-muted/30 transition-colors">
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0 shadow-sm",
                                                    t.isIncome 
                                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" 
                                                        : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                                                )}>
                                                    {t.category?.name?.charAt(0) || "T"}
                                                </div>
                                                <div className="flex flex-col min-w-0 py-0.5">
                                                    <span className="text-sm font-bold truncate line-clamp-1 leading-snug mb-1">{t.description}</span>
                                                    <span className="text-[10px] text-muted-foreground truncate uppercase tracking-widest font-medium opacity-60 leading-relaxed">{t.account?.name}</span>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "text-sm font-black tabular-nums tracking-tighter shrink-0 ml-2 flex items-center",
                                                t.isIncome ? "text-emerald-600" : "text-foreground"
                                            )}>
                                                <span>{t.isIncome ? "+" : "-"}</span>
                                                <AmountDisplay amount={Math.abs(t.amount)} compact={true} showMarquee={false} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-16 text-center flex flex-col items-center gap-4 bg-muted/5">
                                    <div className="w-16 h-16 rounded-3xl bg-muted/20 flex items-center justify-center">
                                        <Layers className="w-8 h-8 text-muted-foreground/20" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Le vide total</p>
                                        <p className="text-[10px] text-muted-foreground/60">Ajoutez une transaction pour commencer</p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="mt-2 text-[10px] font-bold h-8 px-6 rounded-full border-primary/20 text-primary uppercase tracking-tighter"
                                        onClick={() => navigate("/transactions/new")}
                                    >
                                        Nouvelle transaction
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Suivi des budgets mensuels */}
                    {budgets.length > 0 && (
                        <section className="space-y-3 pt-2">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center gap-2">
                                    <Target className="w-4.5 h-4.5 text-primary" />
                                    Objectifs Budgets
                                </h2>
                            </div>
                            <div className="grid gap-4">
                                {budgets.map(budget => (
                                    <Card key={budget.id} className="bg-white/60 dark:bg-white/2 backdrop-blur-md border-border/50 p-5 shadow-sm rounded-2xl transition-all duration-300">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-black tracking-tight">{budget.name}</span>
                                                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                                                    {formatCurrency(budget.spent)} / {formatCurrency(budget.monthlyLimit)}
                                                </span>
                                            </div>
                                            <div className={cn(
                                                "text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm border border-transparent",
                                                budget.percentage > 90 ? "bg-red-500/10 text-red-600 border-red-500/10" : "bg-primary/10 text-primary border-primary/10"
                                            )}>
                                                {Math.round(budget.percentage)}%
                                            </div>
                                        </div>
                                        <div className="w-full h-2.5 bg-muted/30 rounded-full overflow-hidden p-0.5 border border-border/5">
                                            <div 
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-700 ease-out shadow-sm",
                                                    budget.percentage > 90 ? "bg-red-500" : budget.percentage > 70 ? "bg-amber-500" : "bg-primary"
                                                )}
                                                style={{ width: `${budget.percentage}%` }}
                                            />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )}

                </div>
            </div>

            <FAB />
        </div>
    );
}

function TotalBalanceCard({ balance }) {
    const [isCompact, setIsCompact] = useState(true);
    const navigate = useNavigate();
    
    return (
        <Card 
            className="shrink-0 w-[calc(100vw-4rem)] max-w-104 snap-center bg-primary text-primary-foreground border-none shadow-xl shadow-primary/20 relative overflow-hidden py-0 cursor-pointer select-none"
            onClick={() => setIsCompact(!isCompact)}
        >
            <CardContent className="p-5 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div className="space-y-4 min-w-0 flex-1">
                        <p className="text-[10px] font-black opacity-70 uppercase tracking-widest">SOLDE TOTAL</p>
                        <AmountDisplay 
                            amount={balance} 
                            compact={isCompact} 
                            className="text-3xl font-black tracking-tighter"
                        />
                    </div>
                    <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md shrink-0">
                        <Layers className="w-5 h-5 text-white" />
                    </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-tight">
                        Tous vos comptes cumulés
                    </p>
                    <Button 
                        variant="ghost" 
                        size="icon-sm" 
                        className="bg-white/20 hover:bg-white/30 text-white border-none rounded-xl h-9 w-9"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate("/transactions");
                        }}
                    >
                        <History className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
        </Card>
    );
}

function AccountBalanceCard({ account }) {
    const [isCompact, setIsCompact] = useState(true);
    const navigate = useNavigate();
    
    return (
        <Card 
            className="shrink-0 w-[calc(100vw-4rem)] max-w-104 snap-center bg-white/60 dark:bg-white/3 backdrop-blur-md border-border/50 relative overflow-hidden py-0 shadow-sm transition-all duration-300 cursor-pointer select-none"
            onClick={() => setIsCompact(!isCompact)}
        >
            <CardContent className="p-5 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div className="space-y-4 min-w-0 flex-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate">{account.name}</p>
                        <AmountDisplay 
                            amount={account.balance} 
                            compact={isCompact} 
                            className="text-3xl font-black tracking-tighter"
                        />
                    </div>
                    <div className="p-2.5 bg-primary/10 rounded-2xl shrink-0">
                        <WalletCards className="w-5 h-5 text-primary" />
                    </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight">
                        Compte individuel
                    </p>
                    <div className="flex gap-2">
                        <Button 
                            variant="secondary" 
                            size="icon-sm" 
                            className="rounded-xl shadow-sm border border-border/50 h-9 w-9 bg-background/50"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate("/transactions", {
                                    state: {
                                        initialFilters: { accountIds: [account.id] }
                                    }
                                });
                            }}
                        >
                            <History className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button 
                            variant="secondary" 
                            size="icon-sm" 
                            className="rounded-xl shadow-sm border border-border/50 h-9 w-9 bg-background/50"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate("/transactions/transfer", { 
                                    state: { 
                                        from: "/",
                                        defaultValues: { fromAccountId: account.id }
                                    } 
                                });
                            }}
                        >
                            <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button 
                            variant="secondary" 
                            size="icon-sm" 
                            className="rounded-xl shadow-sm border h-9 w-9 bg-primary/10 hover:bg-primary/20 border-primary/10"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate("/transactions/new", { 
                                    state: { 
                                        from: "/",
                                        defaultValues: { accountId: account.id }
                                    } 
                                });
                            }}
                        >
                            <Plus className="w-4 h-4 text-primary" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function MetricCard({ title, amount, variance, icon, color, inverse = false, className }) {
    const [isCompact, setIsCompact] = useState(true);
    const isPositive = variance >= 0;
    const isGood = inverse ? !isPositive : isPositive;

    return (
        <Card 
            className={cn(
                "bg-card/50 backdrop-blur-md border-border/50 animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-sm rounded-3xl transition-all cursor-pointer select-none",
                className
            )}
            onClick={() => setIsCompact(!isCompact)}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">
                    {title}
                </CardTitle>
                <div className={cn(
                    "p-2 rounded-xl backdrop-blur-md shadow-sm border",
                    color === 'emerald' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/10" : "bg-red-500/10 text-red-600 border-red-500/10"
                )}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <AmountDisplay 
                    amount={amount} 
                    compact={isCompact} 
                    className="text-3xl font-black tabular-nums tracking-tighter" 
                />
                <div className="flex items-center gap-1.5 mt-2">
                    <div className={cn(
                        "flex items-center text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm border",
                        isGood 
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/10" 
                            : "bg-red-500/10 text-red-600 border-red-500/10"
                    )}>
                        {isPositive ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                        {Math.abs(variance).toFixed(1)}%
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest">vs mois dernier</span>
                </div>
            </CardContent>
        </Card>
    );
}

function QuickStatsCard({ title, expenses, income }) {
    const [isCompact, setIsCompact] = useState(true);
    
    return (
        <Card 
            className="bg-primary/5 dark:bg-primary/3 border-primary/10 p-4 flex flex-col gap-2 shadow-sm rounded-2xl backdrop-blur-sm cursor-pointer select-none"
            onClick={() => setIsCompact(!isCompact)}
        >
            <div className="flex items-center gap-2 text-primary/70">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">{title}</span>
            </div>
            <div className="flex flex-col min-w-0">
                <AmountDisplay amount={expenses} compact={isCompact} className="text-sm font-black text-red-600" />
                <AmountDisplay amount={income} compact={isCompact} className="text-xs font-bold text-emerald-700 opacity-80" />
            </div>
        </Card>
    );
}
