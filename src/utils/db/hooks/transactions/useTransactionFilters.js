import { useState } from "react";

const defaultInitialFilters = {
    accountIds: [],
    categoryIds: [],
    type: null,
    dateRange: { start: null, end: null },
    amountRange: { min: null, max: null },
}

export function useTransactionFilters(initialOverrides = {}) {
    const [filters, setFilters] = useState({
        ...defaultInitialFilters,
        ...initialOverrides
    });

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const setAllFilters = (newFilters) => {
        setFilters({
            ...defaultInitialFilters,
            ...newFilters
        });
    };
    
    const resetFilters = () => {
        setFilters(defaultInitialFilters);
    };

    const activeFilterCount =
        filters.accountIds.length +
        filters.categoryIds.length +
        (filters.type !== null ? 1 : 0) +
        (filters.dateRange.start || filters.dateRange.end ? 1 : 0) +
        (filters.amountRange.min !== null || filters.amountRange.max !== null ? 1 : 0);

    return { filters, updateFilter, setAllFilters, resetFilters, activeFilterCount };
}