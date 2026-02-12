import { useState } from "react";

const initialFilters = {
    accountIds: [],
    categoryIds: [],
    type: null,
    dateRange: { start: null, end: null },
    amountRange: { min: null, max: null },
}

export function useTransactionFilters() {
    const [filters, setFilters] = useState(initialFilters);

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };
    
    const resetFilters = () => {
        setFilters(initialFilters);
    };

    const activeFilterCount =
        filters.accountIds.length +
        filters.categoryIds.length +
        (filters.type !== null ? 1 : 0) +
        (filters.dateRange.start || filters.dateRange.end ? 1 : 0) +
        (filters.amountRange.min !== null || filters.amountRange.max !== null ? 1 : 0);

    return { filters, updateFilter, resetFilters, activeFilterCount };
}