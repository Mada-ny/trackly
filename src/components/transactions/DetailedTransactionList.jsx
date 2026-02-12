import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Filter, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "../ui/button";

const getMonthTotals = (month) => {
    const allTransactions = Object.values(month.days).flatMap(d => d.transactions);
    const income = allTransactions.filter(t => t.isIncome).reduce((sum, t) => sum + t.amount, 0);
    const expense = allTransactions.filter(t => !t.isIncome).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return { income, expense, balance: income - expense };
};

const getDayTotals = (dayTransactions) => {
    const income = dayTransactions.filter(t => t.isIncome).reduce((sum, t) => sum + t.amount, 0);
    const expense = dayTransactions.filter(t => !t.isIncome).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return { income, expense, balance: income - expense };
};

export default function DetailedTransactionList({ transactions, onTransactionClick }) {
    const [openMonths, setOpenMonths] = useState({});

    const toggleMonth = (monthKey) => {
        setOpenMonths((prev) => ({
            ...prev,
            [monthKey]: !prev[monthKey],
        }));
    };

    const toggleYear = (months) => {
        const allOpen = Object.keys(months).every(
            key => openMonths[key]
        );

        const updates = {};
        Object.keys(months).forEach(key => {
            updates[key] = !allOpen;
        });

        setOpenMonths(prev => ({ ...prev, ...updates }));
    };

    useEffect(() => {
        const currentMonth = format(new Date(), "yyyy-MM");
        setOpenMonths({ [currentMonth]: true });
    }, []);      

    const grouped = (() => {
        const result = {};

        transactions.forEach(t => {
            const date = new Date(t.date);
            const year = format(date, "yyyy");
            const monthKey = format(date, "yyyy-MM");
            const monthLabel = format(date, "MMMM yyyy", { locale: fr });
            const dayKey = format(date, "yyyy-MM-dd");
        
            result[year] ??= {};
            result[year][monthKey] ??= {
                label: monthLabel,
                days: {},
            };

            result[year][monthKey].days[dayKey] ??= {
                date,
                transactions: [],
            };

            result[year][monthKey].days[dayKey].transactions.push(t);
    });

        return result;
    })();

    if (transactions.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-600 mb-2">
                    <Filter className="w-12 h-12 mx-auto opacity-50" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                    Aucune transaction trouvée
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Essayez de modifier vos filtres
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-4">
            {Object.entries(grouped)
                .toSorted(([a], [b]) => b.localeCompare(a))
                .map(([year, months]) => {
                    const monthKeys = Object.keys(months);

                    const isYearOpen = monthKeys.some(
                        key => openMonths[key]
                    );

                    const isYearFullyOpen = monthKeys.every(
                        key => openMonths[key]
                    );

                    return (
                        <div key={year}>
                            <div className="flex justify-between items-center">
                                <h2 className="px-4 py-2 text-lg font-bold text-gray-900 dark:text-white">
                                    {year}
                                </h2>

                                <Button 
                                    variant="outline" size="icon-sm" className="rounded-full"
                                    onClick={() => toggleYear(months)}
                                >
                                    <ChevronDown 
                                        className={`
                                            w-2 h-2
                                            transition-transform duration-200
                                            ${
                                                isYearFullyOpen 
                                                    ? "-rotate-180 text-norway-500" 
                                                    : isYearOpen
                                                        ? "-rotate-90 text-norway-300" 
                                                        : ""
                                            }
                                        `} 
                                    />
                                </Button>
                            </div>

                            {Object.entries(months)
                                .sort(([a], [b]) => b.localeCompare(a))
                                .map(([monthKey, month]) => {
                                    const transactionCount = Object.values(month.days).reduce(
                                        (acc, day) => acc + day.transactions.length,
                                        0
                                    );

                                    const totals = getMonthTotals(month);

                                    return (
                                        <div key={monthKey} className="space-y-2">
                                            <div
                                                onClick={() => toggleMonth(monthKey)}
                                                className="sticky top-0 z-10 bg-gray-50 dark:bg-zinc-950 px-4 py-3 border-b border-gray-200 dark:border-zinc-800 cursor-pointer select-none"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-400 uppercase">
                                                            {month.label}
                                                        </h3>
                                                        <span className="text-xs text-gray-400">
                                                            ({transactionCount})
                                                        </span>
                                                    </div>

                                                    <ChevronDown
                                                        className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                                                            openMonths[monthKey] ? "rotate-180 text-norway-300" : ""
                                                        }`}
                                                    />
                                                </div>

                                                <div className="flex gap-3 text-xs">
                                                    <div className="flex items-center gap-1">
                                                        <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                                            +{totals.income.toLocaleString()} F
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />
                                                        <span className="text-red-600 dark:text-red-400 font-medium">
                                                            -{totals.expense.toLocaleString()} F
                                                        </span>
                                                    </div>
                                                    <div className={`font-semibold ${
                                                        totals.balance >= 0 
                                                            ? 'text-emerald-600 dark:text-emerald-400' 
                                                            : 'text-red-600 dark:text-red-400'
                                                    }`}>
                                                        = {totals.balance >= 0 ? '+' : ''}{totals.balance.toLocaleString()} F
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                className={`
                                                    overflow-hidden transition-[max-height,opacity] duration-200 ease-in-out
                                                    ${openMonths[monthKey] 
                                                        ? "max-h-[3000px] opacity-100 pointer-events-auto" 
                                                        : "max-h-0 opacity-0 pointer-events-none"}
                                                `}
                                            >
                                                {Object.values(month.days)
                                                    .toSorted(
                                                        (a, b) =>
                                                            new Date(b.date) - new Date(a.date)
                                                    )
                                                    .map((group) => (
                                                        <div key={format(group.date, "yyyy-MM-dd")}>
                                                            {(() => {
                                                                const dayTotals = getDayTotals(group.transactions);
                                                                
                                                                return (
                                                                    <div className="px-4 py-2 flex items-center justify-between">
                                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                                                            {format(group.date, "EEEE d MMMM", { locale: fr })}
                                                                        </span>
                                                                        <span className={`text-xs font-semibold ${
                                                                            dayTotals.balance >= 0
                                                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                                                : 'text-red-600 dark:text-red-400'
                                                                        }`}>
                                                                            {dayTotals.balance >= 0 ? '+' : ''}{dayTotals.balance.toLocaleString()} F
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })()}

                                                            <div>
                                                                <div className="space-y-2 px-1 pb-3">
                                                                    {group.transactions.map((transaction) => (
                                                                        <div
                                                                            key={transaction.id}
                                                                            onClick={() =>
                                                                                onTransactionClick(transaction)
                                                                            }
                                                                            className="bg-white dark:bg-zinc-900 rounded-xl p-3 border border-gray-100 dark:border-zinc-800 active:scale-[0.99] transition-transform cursor-pointer"
                                                                        >
                                                                            <div className="flex items-center justify-between gap-3">
                                                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                                    <div
                                                                                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                                                                            transaction.isIncome
                                                                                                ? "bg-emerald-50 dark:bg-emerald-950/20"
                                                                                                : "bg-gray-100 dark:bg-zinc-800"
                                                                                        }`}
                                                                                    >
                                                                                        {transaction.isIncome ? (
                                                                                            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                                                        ) : (
                                                                                            <TrendingDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                                                                        )}
                                                                                    </div>

                                                                                    <div className="flex-1 min-w-0">
                                                                                        <h4 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                                                                                            {transaction.description}
                                                                                        </h4>
                                                                                        <div className="flex items-center gap-2 mt-0.5">
                                                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                                                {transaction.category?.name}
                                                                                            </span>
                                                                                            <span className="text-xs text-gray-400">
                                                                                                •
                                                                                            </span>
                                                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                                                {transaction.account?.name}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                <div
                                                                                    className={`text-right font-bold text-base shrink-0 ${
                                                                                        transaction.isIncome
                                                                                            ? "text-emerald-600 dark:text-emerald-400"
                                                                                            : "text-gray-900 dark:text-white"
                                                                                    }`}
                                                                                >
                                                                                    {transaction.isIncome ? "+" : "-"}
                                                                                    {Math.abs(
                                                                                        transaction.amount
                                                                                    ).toLocaleString()}{" "}
                                                                                    F
                                                                                </div>

                                                                                <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    );
                })}
        </div>
    );
}