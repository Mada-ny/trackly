import { useEffect, useState } from "react";

const STORAGE_KEY = "trackly:transactionFilters";

const defaultInitialFilters = {
    accountIds: [],
    categoryIds: [],
    type: null,
    dateRange: { start: null, end: null },
    amountRange: { min: null, max: null },
}

function serializeFilters(filters) {
    return JSON.stringify({
        ...filters,
        dateRange: {
            start: filters.dateRange.start ? filters.dateRange.start.toISOString() : null,
            end: filters.dateRange.end ? filters.dateRange.end.toISOString() : null,
        },
    });
}

function loadStoredFilters() {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return {
            ...defaultInitialFilters,
            ...parsed,
            dateRange: {
                start: parsed.dateRange?.start ? new Date(parsed.dateRange.start) : null,
                end: parsed.dateRange?.end ? new Date(parsed.dateRange.end) : null,
            },
            amountRange: {
                ...defaultInitialFilters.amountRange,
                ...parsed.amountRange,
            },
        };
    } catch {
        return null;
    }
}

export function useTransactionFilters(initialOverrides = {}) {
    const [filters, setFilters] = useState(() => {
        if (Object.keys(initialOverrides).length > 0) {
            return { ...defaultInitialFilters, ...initialOverrides };
        }
        return loadStoredFilters() ?? defaultInitialFilters;
    });

    // Reflète les filtres dans sessionStorage pour qu'ils survivent à la navigation/au rechargement, mais soient effacés à la fermeture de l'onglet
    useEffect(() => {
        try {
            sessionStorage.setItem(STORAGE_KEY, serializeFilters(filters));
        } catch {
            // sessionStorage indisponible (navigation privée, quota) — persistance best-effort
        }
    }, [filters]);

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