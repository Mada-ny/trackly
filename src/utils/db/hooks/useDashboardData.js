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

/**
 * Hook central pour agréger les données du Dashboard.
 * Calcule les soldes, statistiques de périodes, budgets et données graphiques.
 */
export const useDashboardData = () => {
    const data = useLiveQuery(async () => {
        const accounts = await db.accounts.toArray();
        const categories = await db.categories.toArray();
        const transactions = await db.transactions.toArray();

        if (!accounts || !categories || !transactions) {
            return null;
        }

        const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

        // --- Définition des Périodes ---
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

        // --- 1. Solde Total & Stats Globales ---
        let totalBalance = accounts.reduce((sum, acc) => sum + (acc.initialBalance || 0), 0);
        let globalCur = { income: 0, expenses: 0 };
        let globalPrev = { income: 0, expenses: 0 };
        let todayStats = { income: 0, expenses: 0 };
        let weekStats = { income: 0, expenses: 0 };

        transactions.forEach(t => {
            totalBalance += t.amount;
            const cat = categoryMap.get(t.categoryId);
            
            // Les virements sont exclus des statistiques globales de revenus/dépenses
            const isTransfer = cat?.name === "Transfert";
            const absAmount = Math.abs(t.amount);

            if (!isTransfer) {
                const isIncome = cat?.type === 'income';
                
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
            }
        });

        // --- 2. Métriques par Compte (pour le carrousel) ---
        const accountMetrics = accounts.map(acc => {
            let balance = acc.initialBalance || 0;
            let cur = { income: 0, expenses: 0 };
            let prev = { income: 0, expenses: 0 };

            transactions.filter(t => t.accountId === acc.id).forEach(t => {
                balance += t.amount;
                const cat = categoryMap.get(t.categoryId);
                
                // Pour les comptes individuels, on traite les virements comme des entrées/sorties
                const isTransfer = cat?.name === "Transfert";
                const isIncome = isTransfer ? t.amount > 0 : cat?.type === 'income';
                const absAmount = Math.abs(t.amount);

                if (isWithinInterval(t.date, { start: curMonthStart, end: curMonthEnd })) {
                    if (isIncome) cur.income += absAmount;
                    else cur.expenses += absAmount;
                } else if (isWithinInterval(t.date, { start: prevMonthStart, end: prevMonthEnd })) {
                    if (isIncome) prev.income += absAmount;
                    else prev.expenses += absAmount;
                }
            });

            return {
                id: acc.id,
                name: acc.name,
                balance,
                income: cur.income,
                expenses: cur.expenses,
                comparison: {
                    incomeVar: calculateVariance(cur.income, prev.income),
                    expenseVar: calculateVariance(cur.expenses, prev.expenses)
                }
            };
        });

        // --- 3. Dernières Transactions ---
        const recentTransactions = [...transactions]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 5)
            .map(t => {
                const category = categoryMap.get(t.categoryId);
                const isTransfer = category?.name === "Transfert";
                return {
                    ...t,
                    category,
                    account: accounts.find(a => a.id === t.accountId),
                    isIncome: isTransfer ? t.amount > 0 : category?.type === "income",
                    isTransfer
                };
            });

        // --- 4. Données Graphiques & Budgets ---
        const dailyDataMap = new Map(eachDayOfInterval({
            start: startOfDay(subDays(now, 29)),
            end: startOfDay(now)
        }).map(day => [format(day, 'yyyy-MM-dd'), { income: 0, expenses: 0 }]));

        const categoryBreakdownMap = new Map();
        const budgetMap = new Map(categories.filter(c => c.monthlyLimit).map(c => [c.id, { ...c, spent: 0 }]));

        transactions.forEach(t => {
            const dayKey = format(t.date, 'yyyy-MM-dd');
            const cat = categoryMap.get(t.categoryId);
            const isTransfer = cat?.name === "Transfert";
            const absAmount = Math.abs(t.amount);

            // Graphique d'activité quotidienne
            if (dailyDataMap.has(dayKey)) {
                const dayData = dailyDataMap.get(dayKey);
                if (cat?.type === 'income') dayData.income += t.amount;
                else if (!isTransfer) dayData.expenses += absAmount;
            }

            // Répartition par catégorie & suivi de budget (mois actuel)
            if (isWithinInterval(t.date, { start: curMonthStart, end: curMonthEnd })) {
                if (cat && cat.type === 'expense' && !isTransfer) {
                    categoryBreakdownMap.set(cat.name, (categoryBreakdownMap.get(cat.name) || 0) + absAmount);
                    if (budgetMap.has(t.categoryId)) {
                        budgetMap.get(t.categoryId).spent += absAmount;
                    }
                }
            }
        });

        const dailyChart = {
            labels: Array.from(dailyDataMap.keys()).map(date => format(new Date(date), 'dd MMM', { locale: fr })),
            income: Array.from(dailyDataMap.values()).map(d => d.income),
            expenses: Array.from(dailyDataMap.values()).map(d => d.expenses),
        };

        const sortedCategories = Array.from(categoryBreakdownMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const categoryChart = {
            labels: sortedCategories.map(c => c[0]),
            datasets: sortedCategories.map(c => c[1])
        };

        const budgets = Array.from(budgetMap.values())
            .map(b => ({
                ...b,
                percentage: Math.min((b.spent / b.monthlyLimit) * 100, 100)
            }))
            .sort((a, b) => b.percentage - a.percentage);

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
            budgets,
            accountMetrics,
            recentTransactions,
            dailyChart,
            categoryChart
        };
    }, []);

    return data;
};