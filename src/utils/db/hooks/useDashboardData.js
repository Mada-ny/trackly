import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../schema";
import {
    startOfMonth,
    endOfMonth,
    subMonths,
    isWithinInterval,
    format,
    eachDayOfInterval,
    subDays,
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek
} from "date-fns";
import { fr } from "date-fns/locale";

export const useDashboardData = () => {
    return useLiveQuery(async () => {
        try {
            const accounts = await db.accounts.toArray();
            const categories = await db.categories.toArray();
            const transactions = await db.transactions.toArray();

            if (!accounts || !categories) {
                return { isEmpty: true };
            }

            const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

            const now = new Date();
            const curMonthStart = startOfMonth(now);
            const curMonthEnd = endOfMonth(now);
            const prevMonthStart = startOfMonth(subMonths(now, 1));
            const prevMonthEnd = endOfMonth(subMonths(now, 1));
            const todayInterval = { start: startOfDay(now), end: endOfDay(now) };
            const weekInterval = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };

            const calculateVariance = (n, nMinus1) => {
                if (nMinus1 === 0) return n > 0 ? 100 : 0;
                return ((n - nMinus1) / nMinus1) * 100;
            };

            // Per-account accumulators (keyed by account id)
            const accountDataMap = new Map(
                accounts.map(acc => [acc.id, {
                    balance: acc.initialBalance || 0,
                    cur: { income: 0, expenses: 0 },
                    prev: { income: 0, expenses: 0 }
                }])
            );

            let totalBalance = accounts.reduce((sum, acc) => sum + (acc.initialBalance || 0), 0);
            let globalCur = { income: 0, expenses: 0 };
            let globalPrev = { income: 0, expenses: 0 };
            let todayStats = { income: 0, expenses: 0 };
            let weekStats = { income: 0, expenses: 0 };

            const dailyDataMap = new Map(
                eachDayOfInterval({
                    start: startOfDay(subDays(now, 29)),
                    end: startOfDay(now)
                }).map(day => [format(day, 'yyyy-MM-dd'), { income: 0, expenses: 0 }])
            );

            const categoryBreakdownMap = new Map();
            const budgetMap = new Map(
                categories.filter(c => c.monthlyLimit).map(c => [c.id, { ...c, spent: 0 }])
            );

            // Single pass over all transactions
            transactions.forEach(t => {
                const cat = categoryMap.get(t.categoryId);
                const isTransfer = cat?.name === "Transfert" || !!t.transferId;
                const absAmount = Math.abs(t.amount);

                totalBalance += t.amount;

                // Per-account balance + monthly income/expenses
                const accData = accountDataMap.get(t.accountId);
                if (accData) {
                    accData.balance += t.amount;
                    const isIncomeForAcc = isTransfer ? t.amount > 0 : (cat ? cat.type === 'income' : t.amount > 0);
                    if (isWithinInterval(t.date, { start: curMonthStart, end: curMonthEnd })) {
                        if (isIncomeForAcc) accData.cur.income += absAmount;
                        else accData.cur.expenses += absAmount;
                    } else if (isWithinInterval(t.date, { start: prevMonthStart, end: prevMonthEnd })) {
                        if (isIncomeForAcc) accData.prev.income += absAmount;
                        else accData.prev.expenses += absAmount;
                    }
                }

                if (!isTransfer) {
                    const isIncome = cat ? cat.type === 'income' : t.amount > 0;

                    // Global monthly stats
                    if (isWithinInterval(t.date, { start: curMonthStart, end: curMonthEnd })) {
                        if (isIncome) globalCur.income += absAmount;
                        else globalCur.expenses += absAmount;
                    } else if (isWithinInterval(t.date, { start: prevMonthStart, end: prevMonthEnd })) {
                        if (isIncome) globalPrev.income += absAmount;
                        else globalPrev.expenses += absAmount;
                    }

                    if (isWithinInterval(t.date, todayInterval)) {
                        if (isIncome) todayStats.income += absAmount;
                        else todayStats.expenses += absAmount;
                    }

                    if (isWithinInterval(t.date, weekInterval)) {
                        if (isIncome) weekStats.income += absAmount;
                        else weekStats.expenses += absAmount;
                    }

                    // Daily chart (last 30 days)
                    const dayKey = format(t.date, 'yyyy-MM-dd');
                    const dayData = dailyDataMap.get(dayKey);
                    if (dayData) {
                        if (isIncome) dayData.income += absAmount;
                        else dayData.expenses += absAmount;
                    }

                    // Category breakdown + budget (current month only)
                    if (isWithinInterval(t.date, { start: curMonthStart, end: curMonthEnd })) {
                        const isExpense = cat ? cat.type === 'expense' : t.amount < 0;
                        if (isExpense) {
                            const categoryName = cat?.name || "Sans catégorie";
                            categoryBreakdownMap.set(categoryName, (categoryBreakdownMap.get(categoryName) || 0) + absAmount);
                            if (cat && budgetMap.has(t.categoryId)) {
                                budgetMap.get(t.categoryId).spent += absAmount;
                            }
                        }
                    }
                }
            });

            const accountMetrics = accounts.map(acc => {
                const d = accountDataMap.get(acc.id);
                return {
                    id: acc.id,
                    name: acc.name,
                    balance: d.balance,
                    income: d.cur.income,
                    expenses: d.cur.expenses,
                    comparison: {
                        incomeVar: calculateVariance(d.cur.income, d.prev.income),
                        expenseVar: calculateVariance(d.cur.expenses, d.prev.expenses)
                    }
                };
            });

            const recentTransactions = [...transactions]
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .slice(0, 5)
                .map(t => {
                    const category = categoryMap.get(t.categoryId);
                    const isTransfer = category?.name === "Transfert" || !!t.transferId;
                    return {
                        ...t,
                        category,
                        account: accounts.find(a => a.id === t.accountId),
                        isIncome: isTransfer ? t.amount > 0 : (category ? category.type === "income" : t.amount > 0),
                        isTransfer
                    };
                });

            const dailyChart = {
                labels: Array.from(dailyDataMap.keys()).map(date => format(new Date(date), 'dd MMM', { locale: fr })),
                income: Array.from(dailyDataMap.values()).map(d => d.income),
                expenses: Array.from(dailyDataMap.values()).map(d => d.expenses),
                trend: []
            };

            const totalNetChange = Array.from(dailyDataMap.values()).reduce((sum, d) => sum + (d.income - d.expenses), 0);
            let runningBalance = totalBalance - totalNetChange;
            dailyChart.trend = Array.from(dailyDataMap.values()).map(d => {
                runningBalance += (d.income - d.expenses);
                return runningBalance;
            });

            const sortedCategories = Array.from(categoryBreakdownMap.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            return {
                totalBalance,
                globalMetrics: {
                    income: globalCur.income,
                    expenses: globalCur.expenses,
                    comparison: {
                        incomeVar: calculateVariance(globalCur.income, globalPrev.income),
                        expenseVar: calculateVariance(globalCur.expenses, globalPrev.expenses)
                    }
                },
                todayStats,
                weekStats,
                budgets: Array.from(budgetMap.values())
                    .map(b => ({ ...b, percentage: Math.min((b.spent / b.monthlyLimit) * 100, 100) }))
                    .sort((a, b) => b.percentage - a.percentage),
                accountMetrics,
                recentTransactions,
                dailyChart,
                categoryChart: {
                    labels: sortedCategories.map(c => c[0]),
                    datasets: sortedCategories.map(c => c[1])
                },
                isLoaded: true
            };
        } catch (error) {
            console.error("useDashboardData crash:", error);
            return { isError: true, error };
        }
    }, []);
};
