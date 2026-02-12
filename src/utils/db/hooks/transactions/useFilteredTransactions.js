import { useMemo } from "react";
import { isWithinInterval, startOfDay, endOfDay } from "date-fns";

export function useFilteredTransactions(enrichedTransactions, filters, sortBy = 'date-desc') {
    return useMemo(() => {
        let filtered = [...enrichedTransactions];
    
        if (filters.accountIds.length > 0) {
            filtered = filtered.filter(t => filters.accountIds.includes(t.accountId));
        }
    
        if (filters.categoryIds.length > 0) {
            filtered = filtered.filter(t => filters.categoryIds.includes(t.categoryId));
        }
    
        if (filters.type === 'income') {
            filtered = filtered.filter(t => t.isIncome);
        } else if (filters.type === 'expense') {
            filtered = filtered.filter(t => !t.isIncome);
        }
    
        if (filters.dateRange.start || filters.dateRange.end) {
            filtered = filtered.filter(t => {
                const start = filters.dateRange.start ? startOfDay(filters.dateRange.start) : new Date('1900-01-01');
                const end = filters.dateRange.end ? endOfDay(filters.dateRange.end) : new Date('2100-12-31');
                return isWithinInterval(t.date, { start, end });
            });
        }
    
        if (filters.amountRange.min !== null || filters.amountRange.max !== null) {
            filtered = filtered.filter(t => {
                const absAmount = Math.abs(t.amount);
                const min = filters.amountRange.min || 0;
                const max = filters.amountRange.max || Infinity;
                return absAmount >= min && absAmount <= max;
            });
        }
    
        filtered.sort((a, b) => {
            if (sortBy === 'date-desc') return b.date - a.date;
            if (sortBy === 'date-asc') return a.date - b.date;
            if (sortBy === 'amount-desc') return Math.abs(b.amount) - Math.abs(a.amount);
            if (sortBy === 'amount-asc') return Math.abs(a.amount) - Math.abs(b.amount);
            return 0;
        });
    
        return filtered;
    }, [enrichedTransactions, filters, sortBy]);
}