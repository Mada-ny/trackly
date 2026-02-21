import { createContext, useContext, useMemo } from "react";
import { formatCurrency as formatCurrencyUtil } from "./formatCurrency";
import { useSettings, updateSetting } from "@/utils/db/hooks/useSettings";

const CurrencyContext = createContext();

export const SUPPORTED_CURRENCIES = [
    { code: "XOF", label: "Franc CFA", symbol: "F CFA" },
    { code: "EUR", label: "Euro", symbol: "€" },
    { code: "USD", label: "Dollar", symbol: "$" },
];

export function CurrencyProvider({ children }) {
    const settings = useSettings();

    // Devise par défaut pendant le chargement
    const currency = settings?.currency || "XOF";

    const setCurrency = async (newCurrency) => {
        await updateSetting("currency", newCurrency);
    };

    /**
     * Formate un montant avec la devise actuelle de l'utilisateur.
     */
    const formatCurrency = useMemo(() => {
        return (amount, options = {}) => {
            return formatCurrencyUtil(amount, {
                ...options,
                currency: currency
            });
        };
    }, [currency]);

    const value = {
        currency,
        setCurrency,
        formatCurrency,
        supportedCurrencies: SUPPORTED_CURRENCIES
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
}

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) throw new Error("useCurrency doit être utilisé au sein de CurrencyProvider");
    return context;
};
