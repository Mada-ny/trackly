import { useAccounts, useTransactions, useCategories } from "..";
export function useEnrichedTransactions() { 
    const transactions = useTransactions(); 
    const categories = useCategories(); 
    const accounts = useAccounts(); 
    
    const categoryMap = Object.fromEntries( categories.map((cat) => [cat.id, cat]) ); 
    const accountMap = Object.fromEntries( accounts.map((acc) => [acc.id, acc]) ); 
    
    return transactions
        .map((t) => { 
            const category = categoryMap[t.categoryId];

            return { 
                ...t,
                date: new Date(t.date),
                category, 
                account: accountMap[t.accountId], 
                isIncome: category?.type === 'income', 
            }; 
        }); 
}