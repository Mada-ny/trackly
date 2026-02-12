import DetailedTransactionList from "@/components/transactions/DetailedTransactionList";
import FilterDrawer from "@/components/transactions/FilterDrawer";
import TransactionDetailDrawer from "@/components/transactions/TransactionDetailDrawer";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEnrichedTransactions } from "@/utils/db/hooks/transactions/useEnrichedTransactions";
import { useTransactionFilters } from "@/utils/db/hooks/transactions/useTransactionFilters";
import { useFilteredTransactions } from "@/utils/db/hooks/transactions/useFilteredTransactions";
import { useAccounts, useCategories } from "@/utils/db/hooks";
import { Filter, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { db } from "@/utils/db/schema";
import { format } from "date-fns";
import { FAB } from "@/components/ui/FAB"

export default function TransactionsPage() {
    const { filters, updateFilter, resetFilters, activeFilterCount } = useTransactionFilters();
    const [searchQuery, setSearchQuery] = useState("");

    const enrichedTransactions = useEnrichedTransactions();
    const searchedTransactions = !searchQuery.trim()
        ? enrichedTransactions
        : enrichedTransactions.filter(t => {
            const query = searchQuery.toLowerCase();
            return (
                t.description.toLowerCase().includes(query) ||
                t.category?.name?.toLowerCase().includes(query) ||
                t.account?.name?.toLowerCase().includes(query)
            );
        });
    const filteredTransactions = useFilteredTransactions(searchedTransactions, filters);

    const accounts = useAccounts();
    const categories = useCategories();

    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    const handleTransactionClick = (transaction) => {
        setSelectedTransaction(transaction);
        setDetailDrawerOpen(true);
    };

    const handleEdit = (transaction) => {
        navigate(`/transactions/${transaction.id}/edit`, {
            state: { from: location.pathname }
        });
    };

    const handleDelete = async (transactionId) => {
        try {
            await db.transactions.delete(transactionId);
            toast.success("Transaction supprimée avec succès");
        } catch (error) {
            toast.error("Erreur lors de la suppression");
            console.error(error);
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-zinc-950">
            <div className="sticky top-0 z-30 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            Transactions
                        </h1>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative"
                            onClick={() => setFilterDrawerOpen(true)}
                        >
                            <Filter className="h-5 w-5" />
                            {activeFilterCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    </div>

                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Rechercher une transaction..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        />
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded"
                            >
                                <X className="h-4 w-4 text-gray-400" />
                            </Button>
                        )}
                    </div>

                    {activeFilterCount > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                    {filteredTransactions.length} résultat{filteredTransactions.length > 1 ? 's' : ''}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetFilters}
                                    className="h-7 px-2 text-xs text-blue-600 dark:text-blue-400"
                                >
                                    Tout réinitialiser
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2 pb-1">
                                {filters.type && (
                                    <Badge
                                        variant="secondary"
                                        className="cursor-pointer flex items-center gap-1 px-2 py-1"
                                        onClick={() => updateFilter('type', null)}
                                    >
                                        {filters.type === 'income' ? 'Revenus' : 'Dépenses'}
                                        <X className="size-3" />
                                    </Badge>
                                )}

                                {filters.accountIds.map(accountId => {
                                    const account = accounts.find(a => a.id === accountId);
                                    return account ? (
                                        <Badge
                                            key={accountId}
                                            variant="secondary"
                                            className="cursor-pointer flex items-center gap-1 px-2 py-1"
                                            onClick={() => updateFilter('accountIds', filters.accountIds.filter(id => id !== accountId))}
                                        >
                                            {account.name}
                                            <X className="h-3 w-3" />
                                        </Badge>
                                    ) : null;
                                })}

                                {filters.categoryIds.map(categoryId => {
                                    const category = categories.find(c => c.id === categoryId);
                                    return category ? (
                                        <Badge
                                            key={categoryId}
                                            variant="secondary"
                                            className="cursor-pointer flex items-center gap-1 px-2 py-1"
                                            onClick={() => updateFilter('categoryIds', filters.categoryIds.filter(id => id !== categoryId))}
                                        >
                                            {category.name}
                                            <X className="h-3 w-3" />
                                        </Badge>
                                    ) : null;
                                })}

                                {(filters.dateRange.start || filters.dateRange.end) && (
                                    <Badge
                                        variant="secondary"
                                        className="cursor-pointer flex items-center gap-1 px-2 py-1"
                                        onClick={() => updateFilter('dateRange', { start: null, end: null })}
                                    >
                                        {filters.dateRange.start && format(filters.dateRange.start, 'dd/MM/yy')}
                                        {filters.dateRange.start && filters.dateRange.end && ' → '}
                                        {filters.dateRange.end && format(filters.dateRange.end, 'dd/MM/yy')}
                                        <X className="h-3 w-3" />
                                    </Badge>
                                )}

                                {(filters.amountRange.min || filters.amountRange.max) && (
                                    <Badge
                                        variant="secondary"
                                        className="cursor-pointer flex items-center gap-1 px-2 py-1"
                                        onClick={() => updateFilter('amountRange', { min: null, max: null })}
                                    >
                                        {filters.amountRange.min || 0}F - {filters.amountRange.max || '∞'}F
                                        <X className="h-3 w-3" />
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="px-4 pt-4">
                <DetailedTransactionList transactions={filteredTransactions} onTransactionClick={handleTransactionClick} />
            </div>

            <FilterDrawer
                open={filterDrawerOpen}
                onOpenChange={setFilterDrawerOpen}
                filters={filters}
                updateFilter={updateFilter}
                resetFilters={resetFilters}
            />

            <TransactionDetailDrawer
                open={detailDrawerOpen}
                onOpenChange={setDetailDrawerOpen}
                transaction={selectedTransaction}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <FAB />
        </div>
    );
}