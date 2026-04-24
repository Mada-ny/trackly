import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../schema";
import { 
    startOfMonth, 
    endOfMonth, 
    isWithinInterval, 
    format, 
    eachDayOfInterval,
    addMonths,
    subMonths,
    startOfDay,
    endOfDay
} from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Hook pour générer un rapport statistique complet sur un mois donné.
 * Utilise une logique de cycle financier glissant si des marqueurs isCycleStart sont présents.
 */
export const useMonthlyReportData = (selectedDate) => {
    return useLiveQuery(async () => {
        if (!selectedDate) return null;

        try {
            const accounts = await db.accounts.toArray();
            const categories = await db.categories.toArray();
            const allTransactions = await db.transactions.orderBy('date').toArray();

            if (!accounts || !categories) {
                return { isEmpty: true };
            }

            const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
            
            // --- Définition de la Période Dynamique ---
            // On cherche le marqueur de début pour le mois sélectionné
            // Un marqueur pour "Avril" peut être fin Mars (salaire versé le 28)
            const markers = allTransactions.filter(t => t.isCycleStart);
            
            let intervalStart = startOfMonth(selectedDate);
            let intervalEnd = endOfMonth(selectedDate);

            if (markers.length > 0) {
                // Trouver le marqueur le plus proche de la date sélectionnée (dans le même mois ou juste avant)
                const currentMonthStart = startOfMonth(selectedDate);
                const nextMonthStart = addMonths(currentMonthStart, 1);
                
                // Le marqueur du mois actuel est celui qui définit le cycle du mois sélectionné
                const currentMarker = markers
                    .filter(m => m.date < nextMonthStart)
                    .sort((a, b) => b.date - a.date)[0];

                if (currentMarker) {
                    intervalStart = startOfDay(currentMarker.date);
                    
                    // La fin du cycle est soit le marqueur suivant, soit 1 mois après le marqueur actuel
                    const nextMarker = markers
                        .filter(m => m.date > currentMarker.date)
                        .sort((a, b) => a.date - b.date)[0];
                    
                    if (nextMarker) {
                        // On s'arrête juste avant le début du cycle suivant
                        intervalEnd = new Date(nextMarker.date.getTime() - 1);
                    } else {
                        // Par défaut, un mois après le marqueur
                        intervalEnd = endOfDay(subMonths(addMonths(intervalStart, 1), 0));
                        // Si le marqueur est le 25 Mars, le cycle finit le 24 Avril
                        intervalEnd = new Date(addMonths(intervalStart, 1).getTime() - 1);
                    }
                }
            }

            const interval = { start: intervalStart, end: intervalEnd };

            // --- 1. Agrégation des Métriques ---
            let totalIncome = 0;
            let totalExpenses = 0;
            let nonTransferCount = 0;
            const uniqueTransferIds = new Set();
            
            const categoryBreakdownMap = new Map();
            const incomeCategoryMap = new Map();
            const budgetMap = new Map(categories.filter(c => c.monthlyLimit).map(c => [c.id, { ...c, spent: 0 }]));
            
            const dailyDataMap = new Map(eachDayOfInterval(interval).map(day => [
                format(day, 'yyyy-MM-dd'), 
                { income: 0, expenses: 0 }
            ]));

            allTransactions.forEach(t => {
                if (isWithinInterval(t.date, interval)) {
                    const cat = categoryMap.get(t.categoryId);
                    const isTransfer = cat?.name === "Transfert" || !!t.transferId;
                    const absAmount = Math.abs(t.amount);
                    const dayKey = format(t.date, 'yyyy-MM-dd');

                    if (!isTransfer) {
                        const isIncome = cat ? (cat.type === 'income') : (t.amount > 0);
                        const categoryName = cat?.name || "Sans catégorie";

                        if (isIncome) {
                            totalIncome += absAmount;
                            incomeCategoryMap.set(categoryName, (incomeCategoryMap.get(categoryName) || 0) + absAmount);
                            if (dailyDataMap.has(dayKey)) dailyDataMap.get(dayKey).income += absAmount;
                        } else {
                            totalExpenses += absAmount;
                            categoryBreakdownMap.set(categoryName, (categoryBreakdownMap.get(categoryName) || 0) + absAmount);
                            if (dailyDataMap.has(dayKey)) dailyDataMap.get(dayKey).expenses += absAmount;
                            
                            if (cat && budgetMap.has(t.categoryId)) {
                                budgetMap.get(t.categoryId).spent += absAmount;
                            }
                        }
                        nonTransferCount++;
                    } else if (t.transferId) {
                        uniqueTransferIds.add(t.transferId);
                    }
                }
            });

            const netSavings = totalIncome - totalExpenses;
            let savingsRate = 0;
            if (totalIncome > 0) {
                savingsRate = (netSavings / totalIncome) * 100;
            } else if (totalExpenses > 0) {
                savingsRate = -100;
            }

            const sortedExpenses = Array.from(categoryBreakdownMap.entries())
                .sort((a, b) => b[1] - a[1]);

            const sortedIncome = Array.from(incomeCategoryMap.entries())
                .sort((a, b) => b[1] - a[1]);

            return {
                summary: { totalIncome, totalExpenses, netSavings, savingsRate },
                period: { start: intervalStart, end: intervalEnd },
                topExpenseCategories: sortedExpenses.map(([name, amount]) => ({ name, amount })),
                topIncomeCategories: sortedIncome.map(([name, amount]) => ({ name, amount })),
                dailyChart: {
                    labels: Array.from(dailyDataMap.keys()).map(date => format(new Date(date), 'dd')),
                    income: Array.from(dailyDataMap.values()).map(d => d.income),
                    expenses: Array.from(dailyDataMap.values()).map(d => d.expenses),
                },
                budgets: Array.from(budgetMap.values())
                    .map(b => ({ ...b, percentage: Math.min((b.spent / b.monthlyLimit) * 100, 100) }))
                    .sort((a, b) => b.percentage - a.percentage),
                transactionCount: nonTransferCount + uniqueTransferIds.size,
                isLoaded: true
            };
        } catch (error) {
            console.error("useMonthlyReportData crash:", error);
            return { isError: true, error };
        }
    }, [selectedDate]);
};
