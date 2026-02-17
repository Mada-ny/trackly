import { FAB } from "@/components/ui/FAB";
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
    Target
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
    LineElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

export default function DashboardPage() {
    const data = useDashboardData();
    const [activeIndex, setActiveIndex] = useState(0); // 0 = Total, 1+ = Comptes
    const carouselRef = useRef(null);
    const navigate = useNavigate();

    if (!data) return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    const { 
        totalBalance, globalMetrics, todayStats, weekStats, budgets,
        accountMetrics, recentTransactions, dailyChart, categoryChart 
    } = data;

    // Déterminer les métriques actuelles selon la sélection
    const currentMetrics = activeIndex === 0 
        ? globalMetrics 
        : accountMetrics[activeIndex - 1];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Écouter le défilement du carrousel
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

    const barData = {
        labels: dailyChart.labels,
        datasets: [
            {
                label: 'Revenus',
                data: dailyChart.income,
                backgroundColor: 'rgba(16, 185, 129, 0.6)',
                borderRadius: 4,
            },
            {
                label: 'Dépenses',
                data: dailyChart.expenses,
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                borderRadius: 4,
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
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            <div className="shrink-0 bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-30">
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
                    
                    {/* Carrousel de comptes (défilement horizontal snap) */}
                    <section className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Mes Comptes</h2>
                            <div className="flex gap-1">
                                {Array.from({ length: (accountMetrics?.length || 0) + 1 }).map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={cn(
                                            "w-1 h-1 rounded-full transition-all",
                                            activeIndex === i ? "w-3 bg-primary" : "bg-muted-foreground/30"
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
                            {/* Carte solde total */}
                            <Card className="shrink-0 w-[calc(100vw-4rem)] max-w-104 snap-center bg-primary text-primary-foreground border-none shadow-lg relative overflow-hidden py-0">
                                <CardContent className="p-4 h-full flex flex-col">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-3.5">
                                            <p className="text-[10px] font-bold opacity-70 uppercase tracking-wider">SOLDE TOTAL</p>
                                            <p className="text-2xl font-black">{formatCurrency(totalBalance)}</p>
                                        </div>
                                        <div className="p-2 bg-white/20 rounded-full">
                                            <Layers className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                    
                                    <div className="mt-0.5">
                                        <p className="text-[10px] font-medium opacity-70 mb-1">
                                            Tous vos comptes cumulés
                                        </p>
                                        <div className="flex justify-end gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="icon-sm" 
                                                className="bg-white/20 hover:bg-white/30 text-white border-none rounded-full h-8 w-8"
                                                onClick={() => navigate("/transactions")}
                                            >
                                                <History className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Cartes de comptes individuels */}
                            {accountMetrics?.map(acc => (
                                <Card key={acc.id} className="shrink-0 w-[calc(100vw-4rem)] max-w-104 snap-center bg-card/50 backdrop-blur-sm border-border/50 relative overflow-hidden py-0">
                                    <CardContent className="p-4 h-full flex flex-col">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-3.5">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{acc.name}</p>
                                                <p className="text-2xl font-black">{formatCurrency(acc.balance)}</p>
                                            </div>
                                            <div className="p-2 bg-primary/10 rounded-full">
                                                <WalletCards className="w-4 h-4 text-primary" />
                                            </div>
                                        </div>
                                        
                                        <div className="mt-0.5">
                                            <p className="text-[10px] font-medium text-muted-foreground mb-1">
                                                Compte individuel
                                            </p>
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    variant="secondary" 
                                                    size="icon-sm" 
                                                    className="rounded-full shadow-sm border border-border/50 h-8 w-8"
                                                    onClick={() => navigate("/transactions", {
                                                        state: {
                                                            initialFilters: { accountIds: [acc.id] }
                                                        }
                                                    })}
                                                >
                                                    <History className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="secondary" 
                                                    size="icon-sm" 
                                                    className="rounded-full shadow-sm border border-border/50 h-8 w-8"
                                                    onClick={() => navigate("/transactions/transfer", { 
                                                        state: { 
                                                            from: "/",
                                                            defaultValues: { fromAccountId: acc.id }
                                                        } 
                                                    })}
                                                >
                                                    <ArrowRightLeft className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="secondary" 
                                                    size="icon-sm" 
                                                    className="rounded-full shadow-sm border border-border/50 h-8 w-8"
                                                    onClick={() => navigate("/transactions/new", { 
                                                        state: { 
                                                            from: "/",
                                                            defaultValues: { accountId: acc.id }
                                                        } 
                                                    })}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* Statistiques dynamiques (résumé mensuel) - Change avec la sélection */}
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <MetricCard 
                            title="Revenus du mois" 
                            amount={currentMetrics.income} 
                            variance={currentMetrics.comparison.incomeVar} 
                            icon={<TrendingUp className="h-4 w-4" />}
                            color="emerald"
                            key={`income-${activeIndex}`} 
                        />

                        <MetricCard 
                            title="Dépenses du mois" 
                            amount={currentMetrics.expenses} 
                            variance={currentMetrics.comparison.expenseVar} 
                            icon={<TrendingDown className="h-4 w-4" />}
                            color="red"
                            inverse
                            key={`expense-${activeIndex}`}
                        />
                    </div>

                    {/* Statistiques rapides (Aujourd'hui & Semaine) - Uniquement pour la vue globale */}
                    {activeIndex === 0 && (
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-3 flex flex-col gap-1.5">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    <span className="text-[10px] font-bold uppercase tracking-tight">Aujourd'hui</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-red-500">-{formatCurrency(todayStats.expenses)}</span>
                                    <span className="text-[10px] font-medium text-emerald-600">+{formatCurrency(todayStats.income)}</span>
                                </div>
                            </Card>
                            <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-3 flex flex-col gap-1.5">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    <span className="text-[10px] font-bold uppercase tracking-tight">Cette semaine</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-red-500">-{formatCurrency(weekStats.expenses)}</span>
                                    <span className="text-[10px] font-medium text-emerald-600">+{formatCurrency(weekStats.income)}</span>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Transactions récentes */}
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-primary/10 rounded-lg">
                                    <History className="w-4 h-4 text-primary" />
                                </div>
                                <CardTitle className="text-sm font-bold">Dernières opérations</CardTitle>
                            </div>
                            <Link to="/transactions" className="text-[10px] font-bold text-primary flex items-center gap-0.5">
                                Tout voir <ChevronRight className="w-3 h-3" />
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/30">
                                {recentTransactions?.map(t => (
                                    <div key={t.id} className="flex items-center justify-between p-3 active:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                                                t.isIncome 
                                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" 
                                                    : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                                            )}>
                                                {t.category?.name?.charAt(0) || "T"}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs font-bold truncate leading-none mb-1">{t.description}</span>
                                                <span className="text-[10px] text-muted-foreground truncate italic">{t.account?.name}</span>
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "text-xs font-black tabular-nums",
                                            t.isIncome ? "text-emerald-600 font-bold" : "text-foreground"
                                        )}>
                                            {t.isIncome ? "+" : "-"}{formatCurrency(Math.abs(t.amount))}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section graphiques */}
                    <div className="grid gap-4 md:grid-cols-6 lg:grid-cols-6">
                        <Card className="md:col-span-4 bg-card/50 backdrop-blur-sm border-border/50">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-primary" />
                                        Activité (30j)
                                    </CardTitle>
                                    <CardDescription className="text-[10px]">Flux globaux</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="h-[200px]">
                                <Bar 
                                    data={barData} 
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: {
                                            x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                                            y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 10 } } }
                                        }
                                    }} 
                                />
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2 bg-card/50 backdrop-blur-sm border-border/50">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <PieIcon className="w-4 h-4 text-primary" />
                                    Top Dépenses
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center pt-0">
                                <div className="h-[150px] w-full">
                                    <Doughnut 
                                        data={doughnutData} 
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            cutout: '70%'
                                        }} 
                                    />
                                </div>
                                <div className="mt-4 w-full space-y-1">
                                    {categoryChart.labels.map((label, i) => (
                                        <div key={label} className="flex items-center justify-between text-[10px]">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: doughnutData.datasets[0].backgroundColor[i] }} />
                                                <span className="font-medium truncate max-w-20">{label}</span>
                                            </div>
                                            <span className="font-bold">{formatCurrency(categoryChart.datasets[i])}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Suivi des budgets mensuels */}
                    {budgets.length > 0 && (
                        <section className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                                    <Target className="w-4 h-4 text-primary" />
                                    Budgets du mois
                                </h2>
                            </div>
                            <div className="grid gap-3">
                                {budgets.map(budget => (
                                    <Card key={budget.id} className="bg-card/50 backdrop-blur-sm border-border/50 p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold">{budget.name}</span>
                                                <span className="text-[10px] text-muted-foreground italic">
                                                    {formatCurrency(budget.spent)} sur {formatCurrency(budget.monthlyLimit)}
                                                </span>
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-black px-2 py-0.5 rounded-full",
                                                budget.percentage > 90 ? "bg-red-500/10 text-red-600" : "bg-primary/10 text-primary"
                                            )}>
                                                {Math.round(budget.percentage)}%
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div 
                                                className={cn(
                                                    "h-full transition-all duration-500",
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

function MetricCard({ title, amount, variance, icon, color, inverse = false }) {
    const isPositive = variance >= 0;
    const isGood = inverse ? !isPositive : isPositive;

    return (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {title}
                </CardTitle>
                <div className={cn(
                    "p-1.5 rounded-lg",
                    color === 'emerald' ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                )}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-black tabular-nums">
                    {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'XOF',
                        maximumFractionDigits: 0,
                    }).format(amount)}
                </div>
                <div className="flex items-center gap-1 mt-1">
                    <div className={cn(
                        "flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                        isGood 
                            ? "bg-emerald-500/10 text-emerald-600" 
                            : "bg-red-500/10 text-red-600"
                    )}>
                        {isPositive ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                        {Math.abs(variance).toFixed(1)}%
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">vs mois dernier</span>
                </div>
            </CardContent>
        </Card>
    );
}
