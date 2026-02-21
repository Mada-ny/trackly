import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../schema";

export const useSummaryData = () => {
    return useLiveQuery(async () => {
        try {
            const accounts = await db.accounts.toArray();
            const categories = await db.categories.toArray();
            const transactions = await db.transactions.toArray();

            if (!accounts || !categories) {
                return { totalBalance: 0, totalIncome: 0, totalExpenses: 0, isEmpty: true };
            }

            const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

            let totalBalance = accounts.reduce((sum, account) => sum + (account.initialBalance || 0), 0);
            let totalIncome = 0;
            let totalExpenses = 0;

            transactions.forEach(transaction => {
                const category = categoryMap.get(transaction.categoryId);
                const isTransfer = category?.name === 'Transfert' || !!transaction.transferId;
                
                totalBalance += transaction.amount;

                if (!isTransfer) {
                    const isIncome = category ? (category.type === 'income') : (transaction.amount > 0);
                    
                    if (isIncome) {
                        totalIncome += Math.abs(transaction.amount);
                    } else {
                        totalExpenses += Math.abs(transaction.amount);
                    }
                }
            });

            return { totalBalance, totalIncome, totalExpenses, isLoaded: true };
        } catch (error) {
            console.error("useSummaryData crash:", error);
            return { isError: true, error };
        }
    }, []);
};
