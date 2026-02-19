import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../schema";
import { 
    startOfMonth, 
    endOfMonth, 
    isWithinInterval, 
    format, 
    eachDayOfInterval,
    startOfDay
} from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Hook pour générer un rapport statistique complet sur un mois donné.
 * @param {Date} selectedDate - La date servant à déterminer le mois cible.
 */
export const useMonthlyReportData = (selectedDate) => {
    const data = useLiveQuery(async () => {
        if (!selectedDate) return null;

        const accounts = await db.accounts.toArray();
        const categories = await db.categories.toArray();
        const transactions = await db.transactions.toArray();

        if (!accounts || !categories || !transactions) {
            return null;
        }

        const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
        
        // --- Définition de la Période ---
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        const interval = { start: monthStart, end: monthEnd };

        // --- 1. Agrégation des Métriques ---
        let totalIncome = 0;
        let totalExpenses = 0;
        const categoryBreakdownMap = new Map();
        const incomeCategoryMap = new Map();
        const budgetMap = new Map(categories.filter(c => c.monthlyLimit).map(c => [c.id, { ...c, spent: 0 }]));
        
        // Données quotidiennes pour le graphique
        const dailyDataMap = new Map(eachDayOfInterval(interval).map(day => [
            format(day, 'yyyy-MM-dd'), 
            { income: 0, expenses: 0 }
        ]));

        transactions.forEach(t => {
            if (isWithinInterval(t.date, interval)) {
                const cat = categoryMap.get(t.categoryId);
                const isTransfer = cat?.name === "Transfert";
                const absAmount = Math.abs(t.amount);
                const dayKey = format(t.date, 'yyyy-MM-dd');

                if (!isTransfer) {
                    if (cat?.type === 'income') {
                        totalIncome += absAmount;
                        incomeCategoryMap.set(cat.name, (incomeCategoryMap.get(cat.name) || 0) + absAmount);
                        if (dailyDataMap.has(dayKey)) dailyDataMap.get(dayKey).income += absAmount;
                    } else {
                        totalExpenses += absAmount;
                        categoryBreakdownMap.set(cat.name, (categoryBreakdownMap.get(cat.name) || 0) + absAmount);
                        if (dailyDataMap.has(dayKey)) dailyDataMap.get(dayKey).expenses += absAmount;
                        
                        // Suivi budget
                        if (budgetMap.has(t.categoryId)) {
                            budgetMap.get(t.categoryId).spent += absAmount;
                        }
                    }
                }
            }
        });

        const netSavings = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

        // --- 2. Formatage des Top Catégories ---
        const topExpenseCategories = Array.from(categoryBreakdownMap.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([name, amount]) => ({ name, amount }));

        const topIncomeCategories = Array.from(incomeCategoryMap.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([name, amount]) => ({ name, amount }));

        // --- 3. Formatage du Graphique Quotidien ---
        const dailyChart = {
            labels: Array.from(dailyDataMap.keys()).map(date => format(new Date(date), 'dd')),
            income: Array.from(dailyDataMap.values()).map(d => d.income),
            expenses: Array.from(dailyDataMap.values()).map(d => d.expenses),
        };

        // --- 4. Formatage des Budgets ---
        const budgets = Array.from(budgetMap.values())
            .map(b => ({
                ...b,
                percentage: Math.min((b.spent / b.monthlyLimit) * 100, 100)
            }))
            .sort((a, b) => b.percentage - a.percentage);

        return {
            summary: {
                totalIncome,
                totalExpenses,
                netSavings,
                savingsRate
            },
            topExpenseCategories,
            topIncomeCategories,
            dailyChart,
            budgets,
            transactionCount: transactions.filter(t => isWithinInterval(t.date, interval)).length
        };
    }, [selectedDate]);

    return data;
};
