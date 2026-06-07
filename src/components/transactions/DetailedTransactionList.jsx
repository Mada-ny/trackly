import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useMemo, useRef, useState } from "react";
import { useVirtualizer } from '@tanstack/react-virtual'
import { TrendingDown, TrendingUp, ChevronRight, Inbox, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AmountDisplay } from "@/components/ui/amount-display";

// --- Sub-Components ---

function MonthHeaderRow({ month, totals, transactionCount, isCollapsed, onToggle }) {
    return (
        <div 
            className="sticky top-0 z-20 bg-background/95 backdrop-blur-md px-4 py-4 border-b border-border/50 shadow-sm transition-colors"
        >
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <button
                        className="flex items-center gap-2 cursor-pointer active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                        onClick={onToggle}
                        aria-expanded={!isCollapsed}
                    >
                        <h3 className="text-lg font-bold tracking-tight text-foreground capitalize">
                            {month}
                        </h3>
                        <ChevronDown aria-hidden="true" className={cn(
                            "w-4 h-4 text-muted-foreground transition-transform duration-200",
                            isCollapsed && "-rotate-90"
                        )} />
                    </button>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {transactionCount} opé.
                    </span>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-wider select-none">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 min-w-0 flex-1">
                        <TrendingUp className="w-3 h-3 shrink-0" />
                        <span className="shrink-0">+</span>
                        <AmountDisplay amount={totals.income} compact={true} showMarquee={false} className="text-[11px] font-semibold" />
                    </div>
                    <div className="flex items-center gap-1.5 text-red-500 dark:text-red-400 min-w-0 flex-1">
                        <TrendingDown className="w-3 h-3 shrink-0" />
                        <span className="shrink-0">-</span>
                        <AmountDisplay amount={totals.expense} compact={true} showMarquee={false} className="text-[11px] font-semibold" />
                    </div>
                    <div className={cn(
                        "ml-auto px-2 py-0.5 rounded-md flex items-center min-w-0 max-w-[40%]",
                        totals.balance >= 0 
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" 
                            : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                    )}>
                        <span className="shrink-0">{totals.balance >= 0 ? '+' : ''}</span>
                        <AmountDisplay amount={totals.balance} compact={true} showMarquee={false} className="text-[11px] font-semibold" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function DayHeaderRow({ date, totals }) {
    return (
        <div className="flex items-center justify-between py-2 px-4 bg-muted/30 border-b border-border/40 select-none">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                {format(date, "EEEE d", { locale: fr })}
            </span>
            <div className={cn(
                "text-xs font-bold flex items-center min-w-0 max-w-[60%]",
                totals.balance >= 0 ? "text-emerald-600" : "text-red-500"
            )}>
                <span className="shrink-0">{totals.balance >= 0 ? '+' : ''}</span>
                <AmountDisplay amount={totals.balance} compact={true} showMarquee={false} className="text-xs font-bold" />
            </div>
        </div>
    );
}

function TransactionRow({ transaction, onClick }) {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onClick(transaction)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(transaction); } }}
            aria-label={`${transaction.description}, ${transaction.isIncome ? '+' : '-'}${Math.abs(transaction.amount)}`}
            className="group relative flex items-center justify-between gap-3 px-4 py-3 cursor-pointer transition-colors active:bg-muted/50 hover:bg-muted/10 border-b border-border/30 last:border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 shadow-sm",
                    transaction.isIncome 
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" 
                        : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                )}>
                    {transaction.category?.name?.charAt(0) || "T"}
                </div>
                
                <div className="flex-1 min-w-0 py-0.5 grid grid-cols-1 md:grid-cols-12 md:items-center gap-2">
                    <div className="md:col-span-6 lg:col-span-5">
                        <h4 className="text-sm font-bold text-foreground line-clamp-1 leading-snug">
                            {transaction.description}
                        </h4>
                    </div>
                    
                    <div className="md:col-span-3 lg:col-span-3 hidden md:flex items-center">
                        <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-tighter truncate">
                            {transaction.category?.name || "Sans catégorie"}
                        </span>
                    </div>

                    <div className="md:col-span-3 lg:col-span-4 hidden lg:flex items-center">
                        <span className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest truncate">
                            {transaction.account?.name}
                        </span>
                    </div>

                    <div className="md:hidden flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                        <span>{transaction.category?.name}</span>
                        <span className="opacity-30">•</span>
                        <span>{transaction.account?.name}</span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-4 shrink-0">
                <div className={cn(
                    "text-sm font-black tabular-nums flex items-center justify-end min-w-[80px]",
                    transaction.isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                )}>
                    <span className="shrink-0">{transaction.isIncome ? "+" : "-"}</span>
                    <AmountDisplay amount={Math.abs(transaction.amount)} compact={true} showMarquee={false} className="text-sm font-black" />
                </div>
                <div className="w-6 h-6 flex items-center justify-center rounded-full group-hover:bg-muted transition-colors">
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                </div>
            </div>
        </div>
    );
}


export default function DetailedTransactionList({ 
    transactions, 
    allTransactions = [], 
    onTransactionClick 
}) {
    const parentRef = useRef(null);
    const [collapsedMonths, setCollapsedMonths] = useState({});

    const toggleMonth = (monthKey) => {
        setCollapsedMonths(prev => ({
            ...prev,
            [monthKey]: !prev[monthKey]
        }));
    };

    // Pré-calculer les totaux pour TOUS les mois et jours disponibles
    const periodTotals = useMemo(() => {
        const monthTotals = {};
        const dayTotals = {};

        allTransactions.forEach(t => {
            const mKey = format(t.date, "yyyy-MM");
            const dKey = format(t.date, "yyyy-MM-dd");

            if (!monthTotals[mKey]) monthTotals[mKey] = { income: 0, expense: 0, balance: 0 };
            if (!dayTotals[dKey]) dayTotals[dKey] = { income: 0, expense: 0, balance: 0 };

            const absAmount = Math.abs(t.amount);
            
            // On accumule pour le mois
            if (t.isTransfer) {
                // Pour le virement, on n'impacte que la balance (car exclu des flux globaux)
                monthTotals[mKey].balance += t.amount;
            } else {
                if (t.isIncome) monthTotals[mKey].income += absAmount;
                else monthTotals[mKey].expense += absAmount;
                monthTotals[mKey].balance += t.amount;
            }

            // On accumule pour le jour
            if (t.isTransfer) {
                dayTotals[dKey].balance += t.amount;
            } else {
                if (t.isIncome) dayTotals[dKey].income += absAmount;
                else dayTotals[dKey].expense += absAmount;
                dayTotals[dKey].balance += t.amount;
            }
        });

        return { monthTotals, dayTotals };
    }, [allTransactions]);

    // Aplatir les données pour le virtualiseur
    const rowData = useMemo(() => {
        const flatList = [];
        const groupedByMonth = transactions.reduce((acc, t) => {
            const monthKey = format(t.date, "yyyy-MM");
            if (!acc[monthKey]) {
                acc[monthKey] = [];
            }
            acc[monthKey].push(t);
            return acc;
        }, {});

        const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => b.localeCompare(a));

        for (const monthKey of sortedMonths) {
            const monthTransactions = groupedByMonth[monthKey];
            const isCollapsed = !!collapsedMonths[monthKey];
            
            flatList.push({
                type: 'monthHeader',
                id: `month-${monthKey}`,
                monthKey,
                month: format(new Date(monthKey + "-01"), "MMMM yyyy", { locale: fr }),
                totals: periodTotals.monthTotals[monthKey],
                transactionCount: monthTransactions.length,
                isCollapsed,
            });

            if (!isCollapsed) {
                const groupedByDay = monthTransactions.reduce((acc, t) => {
                    const dayKey = format(t.date, "yyyy-MM-dd");
                    if (!acc[dayKey]) {
                        acc[dayKey] = [];
                    }
                    acc[dayKey].push(t);
                    return acc;
                }, {});

                const sortedDays = Object.keys(groupedByDay).sort((a, b) => b.localeCompare(a));

                for (const dayKey of sortedDays) {
                    const dayTransactions = groupedByDay[dayKey];

                    flatList.push({
                        type: 'dayHeader',
                        id: `day-${dayKey}`,
                        date: new Date(dayKey),
                        totals: periodTotals.dayTotals[dayKey],
                    });

                    dayTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());

                    dayTransactions.forEach(t => {
                        flatList.push({
                            type: 'transaction',
                            id: t.id,
                            transaction: t,
                        });
                    });
                }
            }
        }
        return flatList;
    }, [transactions, collapsedMonths, periodTotals]);
    
    // Virtualizer hook
    const rowVirtualizer = useVirtualizer({
        count: rowData.length,
        getScrollElement: () => parentRef.current,
        estimateSize: (index) => {
            const item = rowData[index];
            if (item.type === 'monthHeader') return 88;
            if (item.type === 'dayHeader') return 36;
            return 64;
        },
        overscan: 10,
    });
    
    // Empty state
    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                    <Inbox className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Aucune transaction</h3>
                <p className="text-sm text-muted-foreground max-w-[200px]">
                    Nous n'avons trouvé aucune transaction correspondant à vos critères.
                </p>
            </div>
        );
    }

    return (
        <div ref={parentRef} className="h-full overflow-y-auto scrollbar-none pb-24">
            <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                    const item = rowData[virtualItem.index];

                    return (
                        <div
                            key={virtualItem.key}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: `${virtualItem.size}px`,
                                transform: `translateY(${virtualItem.start}px)`,
                            }}
                        >
                            {item.type === 'monthHeader' && (
                                <MonthHeaderRow 
                                    {...item} 
                                    onToggle={() => toggleMonth(item.monthKey)} 
                                />
                            )}
                            {item.type === 'dayHeader' && <DayHeaderRow {...item} />}
                            {item.type === 'transaction' && <TransactionRow {...item} onClick={onTransactionClick} />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
