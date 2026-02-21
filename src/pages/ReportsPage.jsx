import { useState, useEffect } from "react";
import { 
    ChevronLeft, 
    ChevronRight, 
    Calendar, 
    TrendingUp, 
    TrendingDown, 
    PiggyBank,
    BarChart3,
    PieChart as PieIcon,
    Target,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { useMonthlyReportData } from "@/utils/db/hooks";
import { format, addMonths, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bar } from 'react-chartjs-2';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    Title, 
    Tooltip, 
    Legend 
} from 'chart.js';
import { useCurrency } from "@/utils/number/CurrencyProvider";
import { AmountDisplay } from "@/components/ui/amount-display";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function ReportsPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const data = useMonthlyReportData(selectedDate);
    const { formatCurrency } = useCurrency();
    const [showLoading, setShowLoading] = useState(false);

    useEffect(() => {
        if (!data) {
            const timer = setTimeout(() => setShowLoading(true), 200);
            return () => clearTimeout(timer);
        }
    }, [data]);

    const handlePrevMonth = () => setSelectedDate(prev => subMonths(prev, 1));
    const handleNextMonth = () => setSelectedDate(prev => addMonths(prev, 1));
    const handleReset = () => setSelectedDate(new Date());

    if (data?.isError) return (
        <div className="flex h-screen items-center justify-center p-8 text-center flex-col gap-4">
            <div className="text-destructive font-bold">Erreur lors de la lecture de la base de données</div>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
    );

    if (!data || !data.isLoaded) {
        if (!showLoading) return <div className="h-screen bg-background" />;
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    const { summary, topExpenseCategories, dailyChart, budgets, transactionCount } = data;

    const chartData = {
        labels: dailyChart.labels,
        datasets: [
            {
                label: 'Revenus',
                data: dailyChart.income,
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                borderRadius: 4,
            },
            {
                label: 'Dépenses',
                data: dailyChart.expenses,
                backgroundColor: 'rgba(239, 68, 68, 0.5)',
                borderRadius: 4,
            }
        ]
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            <div className="shrink-0 glass-header border-b border-border/50 sticky top-0 z-30">
                <div className="px-4 pt-6 pb-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-black tracking-tight text-foreground">
                            Rapports
                        </h1>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                            onClick={handleReset}
                        >
                            Aujourd'hui
                        </Button>
                    </div>

                    <div className="flex items-center justify-between bg-muted/50 p-1.5 rounded-2xl">
                        <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9" onClick={handlePrevMonth}>
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-sm font-black uppercase tracking-tight">
                                {format(selectedDate, 'MMMM yyyy', { locale: fr })}
                            </span>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9" onClick={handleNextMonth}>
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grow overflow-y-auto no-scrollbar">
                <div className="p-4 pb-24 space-y-6 max-w-4xl mx-auto">
                    
                    <div className="grid grid-cols-3 gap-3">
                        <ReportMiniCard 
                            title="Entrées" 
                            amount={summary.totalIncome} 
                            icon={<TrendingUp className="w-3.5 h-3.5" />}
                            color="emerald"
                        />
                        <ReportMiniCard 
                            title="Sorties" 
                            amount={summary.totalExpenses} 
                            icon={<TrendingDown className="w-3.5 h-3.5" />}
                            color="red"
                        />
                        <ReportMiniCard 
                            title="Épargne" 
                            amount={summary.netSavings} 
                            icon={<PiggyBank className="w-3.5 h-3.5" />}
                            color="primary"
                        />
                    </div>

                    <Card className="bg-primary/5 border-primary/10 overflow-hidden rounded-3xl">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">Taux d'épargne</p>
                                <p className="text-3xl font-black tracking-tighter text-primary">
                                    {summary.savingsRate.toFixed(1)}%
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Volume</p>
                                <p className="text-sm font-bold">{transactionCount} opérations</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/60 dark:bg-white/2 backdrop-blur-md border-border/50 shadow-sm rounded-3xl overflow-hidden flex flex-col">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-primary" />
                                        Activité Mensuelle
                                    </CardTitle>
                                    <CardDescription className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Flux quotidiens</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[200px] px-2">
                            {transactionCount > 0 ? (
                                <Bar 
                                    data={chartData} 
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: {
                                            x: { grid: { display: false }, ticks: { font: { size: 9, weight: 'bold' }, color: 'oklch(0.45 0.04 155)' } },
                                            y: { grid: { color: 'rgba(0,0,0,0.02)' }, ticks: { display: false } }
                                        }
                                    }} 
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center opacity-40 italic text-xs">
                                    Aucune donnée pour ce mois
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <section className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <PieIcon className="w-4 h-4 text-primary" />
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Où est passé mon argent ?</h2>
                        </div>
                        <div className="grid gap-3">
                            {topExpenseCategories.slice(0, 5).map((cat, i) => (
                                <CategoryReportItem key={cat.name} category={cat} index={i} totalExpenses={summary.totalExpenses} />
                            ))}
                            {topExpenseCategories.length === 0 && (
                                <div className="text-center py-8 opacity-40 italic text-xs">Aucune dépense ce mois-ci</div>
                            )}
                        </div>
                    </section>

                    {budgets.length > 0 && (
                        <section className="space-y-3 pt-2">
                            <div className="flex items-center gap-2 px-1">
                                <Target className="w-4 h-4 text-primary" />
                                <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">État des Budgets</h2>
                            </div>
                            <div className="grid gap-4">
                                {budgets.map(budget => (
                                    <Card key={budget.id} className="bg-white/60 dark:bg-white/2 backdrop-blur-md border-border/50 p-5 shadow-sm rounded-2xl">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-black tracking-tight">{budget.name}</span>
                                                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                                                    {formatCurrency(budget.spent)} / {formatCurrency(budget.monthlyLimit)}
                                                </span>
                                            </div>
                                            <div className={cn(
                                                "text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm border",
                                                budget.percentage > 90 ? "bg-red-500/10 text-red-600 border-red-500/10" : "bg-primary/10 text-primary border-primary/10"
                                            )}>
                                                {Math.round(budget.percentage)}%
                                            </div>
                                        </div>
                                        <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                                            <div 
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-700 ease-out",
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
        </div>
    );
}

function ReportMiniCard({ title, amount, icon, color }) {
    const [isCompact, setIsCompact] = useState(true);
    const isPrimary = color === 'primary';
    const isRed = color === 'red';
    const isEmerald = color === 'emerald';
    const displayAmount = isPrimary ? amount : Math.abs(amount);

    return (
        <div 
            className={cn(
                "p-3 rounded-2xl border flex flex-col gap-2 shadow-sm transition-all animate-in fade-in zoom-in duration-300 cursor-pointer select-none",
                isPrimary && "bg-primary/10 border-primary/10 text-primary",
                isRed && "bg-red-500/5 border-red-500/10 text-red-600",
                isEmerald && "bg-emerald-500/5 border-emerald-500/10 text-emerald-600"
            )}
            onClick={() => setIsCompact(!isCompact)}
        >
            <div className="flex items-center gap-1.5 opacity-70">
                {icon}
                <span className="text-[9px] font-black uppercase tracking-widest truncate">{title}</span>
            </div>
            <AmountDisplay 
                amount={displayAmount} 
                compact={isCompact} 
                className="text-xs font-black tabular-nums tracking-tighter" 
            />
        </div>
    );
}

function CategoryReportItem({ category, index, totalExpenses }) {
    const [isCompact, setIsCompact] = useState(true);
    
    return (
        <div 
            className="flex items-center justify-between p-4 bg-white/60 dark:bg-white/2 backdrop-blur-md border border-border/50 rounded-2xl shadow-sm cursor-pointer select-none"
            onClick={() => setIsCompact(!isCompact)}
        >
            <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
                <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center text-[10px] font-black shrink-0">
                    #{index + 1}
                </div>
                <span className="text-sm font-bold truncate">{category.name}</span>
            </div>
            <div className="text-right shrink-0 max-w-[50%]">
                <AmountDisplay 
                    amount={category.amount} 
                    compact={isCompact} 
                    className="text-sm font-black tabular-nums" 
                />
                <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                    {((category.amount / totalExpenses) * 100).toFixed(0)}% du total
                </p>
            </div>
        </div>
    );
}
