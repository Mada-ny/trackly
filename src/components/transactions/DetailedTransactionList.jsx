import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useMemo, useRef, useState } from "react";
import { useVirtualizer } from '@tanstack/react-virtual'
import { TrendingDown, TrendingUp, ChevronRight, Inbox, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Sub-Components ---

function MonthHeaderRow({ month, totals, transactionCount, isCollapsed, onToggle }) {
    return (
        <div 
            onClick={onToggle}
            className="sticky top-0 z-20 bg-background/95 backdrop-blur-md px-4 py-4 border-b border-border/50 shadow-sm cursor-pointer active:bg-muted/50 transition-colors"
        >
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold tracking-tight text-foreground capitalize">
                            {month}
                        </h3>
                        <ChevronDown className={cn(
                            "w-4 h-4 text-muted-foreground transition-transform duration-200",
                            isCollapsed && "-rotate-90"
                        )} />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {transactionCount} opé.
                    </span>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="w-3 h-3" />
                        <span>+{totals.income.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-red-500 dark:text-red-400">
                        <TrendingDown className="w-3 h-3" />
                        <span>-{totals.expense.toLocaleString()}</span>
                    </div>
                    <div className={cn(
                        "ml-auto px-2 py-0.5 rounded-md",
                        totals.balance >= 0 
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" 
                            : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                    )}>
                        {totals.balance >= 0 ? '+' : ''}{totals.balance.toLocaleString()} FCFA
                    </div>
                </div>
            </div>
        </div>
    );
}

function DayHeaderRow({ date, totals }) {
    return (
        <div className="flex items-center justify-between py-2 px-4 bg-muted/30 border-b border-border/40">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                {format(date, "EEEE d", { locale: fr })}
            </span>
            <span className={cn(
                "text-xs font-bold",
                totals.balance >= 0 ? "text-emerald-600" : "text-red-500"
            )}>
                {totals.balance >= 0 ? '+' : ''}{totals.balance.toLocaleString()}
            </span>
        </div>
    );
}

function TransactionRow({ transaction, onClick }) {
    return (
        <div
            onClick={() => onClick(transaction)}
            className="group relative flex items-center justify-between gap-3 px-4 py-3 cursor-pointer transition-colors active:bg-muted/50 border-b border-border/30 last:border-0"
        >
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                    transaction.isIncome 
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" 
                        : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                )}>
                    {transaction.category?.name?.charAt(0) || "T"}
                </div>
                
                <div className="flex-1 min-w-0 py-0.5">
                    <h4 className="text-sm font-semibold text-foreground line-clamp-1 leading-snug mb-0.5">
                        {transaction.description}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground leading-relaxed">
                        <span className="truncate max-w-[100px]">{transaction.category?.name}</span>
                        <span className="opacity-30">•</span>
                        <span className="truncate max-w-[100px]">{transaction.account?.name}</span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <div className={cn(
                    "text-sm font-bold tabular-nums",
                    transaction.isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                )}>
                    {transaction.isIncome ? "+" : "-"}{Math.abs(transaction.amount).toLocaleString()}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
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
        <div ref={parentRef} className="h-full overflow-y-auto scrollbar-none">
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