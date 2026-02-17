import { db } from "../schema";
import { useDexieTable } from "./useDexieTable";
import { useEntity } from "./useEntity";
import { useSummaryData } from "./useSummaryData";
import { useDashboardData } from "./useDashboardData";

// Hooks de données de liste
export const useAccounts = () => useDexieTable(db.accounts);
export const useCategories = () => useDexieTable(db.categories);
export const useTransactions = () => useDexieTable(db.transactions);

// Hooks de données uniques
export const useAccount = (id) => useEntity(db.accounts, id);
export const useCategory = (id) => useEntity(db.categories, id);
export const useTransaction = (id) => useEntity(db.transactions, id); 

// Hooks de données résumées
export { useSummaryData, useDashboardData };