import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../schema";

export const useSummaryData = () => {
    const summaryData = useLiveQuery(async () => {
        const accounts = await db.accounts.toArray();
        const categories = await db.categories.toArray();
        const transactions = await db.transactions.toArray();

        if (!accounts || !categories || !transactions) {
            return { totalBalance: 0, totalIncome: 0, totalExpenses: 0 };
        }

        let totalBalance = accounts.reduce((sum, account) => sum + (account.initialBalance || 0), 0);
        let totalIncome = 0;
        let totalExpenses = 0;

        const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

        transactions.forEach(transaction => {
            const category = categoryMap.get(transaction.categoryId);
            const isTransfer = category?.name === 'Transfert';
            
            totalBalance += transaction.amount;

            if (!isTransfer) {
                if (category?.type === 'income') {
                    totalIncome += transaction.amount;
                } else if (category?.type === 'expense') {
                    totalExpenses += Math.abs(transaction.amount);
                }
            }
        });

        return { totalBalance, totalIncome, totalExpenses };
    }, []);

    return summaryData || { totalBalance: 0, totalIncome: 0, totalExpenses: 0 };
};