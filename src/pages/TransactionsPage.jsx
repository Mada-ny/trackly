import DetailedTransactionList from "@/components/transactions/DetailedTransactionList";
import FilterDrawer from "@/components/transactions/FilterDrawer";
import TransactionDetailDrawer from "@/components/transactions/TransactionDetailDrawer";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { useEnrichedTransactions } from "@/utils/db/hooks/transactions/useEnrichedTransactions";
import { useTransactionFilters } from "@/utils/db/hooks/transactions/useTransactionFilters";
import { useFilteredTransactions } from "@/utils/db/hooks/transactions/useFilteredTransactions";
import { useAccounts, useCategories } from "@/utils/db/hooks";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { db } from "@/utils/db/schema";
import { format } from "date-fns";
import { FAB } from "@/components/ui/FAB"

export default function TransactionsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const initialFilters = location.state?.initialFilters || {};
    const { filters, updateFilter, setAllFilters, resetFilters, activeFilterCount } = useTransactionFilters(initialFilters);
    
    useEffect(() => {
        if (location.state?.initialFilters) {
            setAllFilters(location.state.initialFilters);
        }
    }, [location.state?.initialFilters, setAllFilters]);

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

    const enrichedTransactions = useEnrichedTransactions();
    const searchedTransactions = !debouncedSearchQuery.trim()
        ? enrichedTransactions
        : enrichedTransactions.filter(t => {
            const query = debouncedSearchQuery.toLowerCase();
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

    const handleTransactionClick = (transaction) => {
        setSelectedTransaction(transaction);
        setDetailDrawerOpen(true);
    };

    const handleEdit = (transaction) => {
        if (transaction.isTransfer && transaction.transferId) {
            navigate(`/transactions/transfer/${transaction.transferId}/edit`, {
                state: { from: location.pathname }
            });
        } else {
            navigate(`/transactions/${transaction.id}/edit`, {
                state: { from: location.pathname }
            });
        }
    };

    const handleDelete = async (transactionId) => {
        try {
            const transaction = enrichedTransactions.find(t => t.id === transactionId);
            
            if (transaction?.isTransfer && transaction.transferId) {
                await db.transactions.where("transferId").equals(transaction.transferId).delete();
                toast.success("Virement supprimé");
            } else {
                await db.transactions.delete(transactionId);
                toast.success("Transaction supprimée");
            }
        } catch (error) {
            toast.error("Erreur lors de la suppression");
            console.error(error);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            <div className="shrink-0 glass-header">
                <div className="px-4 pt-6 pb-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-foreground">
                                Transactions
                            </h1>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="rounded-full gap-2 h-9 px-4 font-semibold shadow-sm"
                            onClick={() => setFilterDrawerOpen(true)}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            <span>Filtres</span>
                            {activeFilterCount > 0 && (
                                <span className="flex items-center justify-center bg-primary text-primary-foreground text-[10px] rounded-full h-5 min-w-5 px-1 ml-1">
                                    {activeFilterCount}
                                </span>
                            )}
                        </Button>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 h-11 rounded-2xl border-none bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-base"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                            >
                                <X className="h-4 w-4 text-muted-foreground" />
                            </button>
                        )}
                    </div>

                    {activeFilterCount > 0 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetFilters}
                                className="h-7 px-2 text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                            >
                                <X className="mr-1 h-3 w-3" />
                                Tout effacer
                            </Button>
                            
                            <div className="flex items-center gap-1.5 shrink-0">
                                {filters.type && (
                                    <FilterBadge 
                                        label={filters.type === 'income' ? 'Revenus' : 'Dépenses'} 
                                        onRemove={() => updateFilter('type', null)} 
                                    />
                                )}

                                {filters.accountIds.map(accountId => {
                                    const account = accounts.find(a => a.id === accountId);
                                    return account ? (
                                        <FilterBadge 
                                            key={accountId}
                                            label={account.name} 
                                            onRemove={() => updateFilter('accountIds', filters.accountIds.filter(id => id !== accountId))} 
                                        />
                                    ) : null;
                                })}

                                {filters.categoryIds.map(categoryId => {
                                    const category = categories.find(c => c.id === categoryId);
                                    return category ? (
                                        <FilterBadge 
                                            key={categoryId}
                                            label={category.name} 
                                            onRemove={() => updateFilter('categoryIds', filters.categoryIds.filter(id => id !== categoryId))} 
                                        />
                                    ) : null;
                                })}

                                {(filters.dateRange.start || filters.dateRange.end) && (
                                    <FilterBadge 
                                        label={
                                            <>
                                                {filters.dateRange.start && format(filters.dateRange.start, 'dd/MM')}
                                                {filters.dateRange.start && filters.dateRange.end && ' → '}
                                                {filters.dateRange.end && format(filters.dateRange.end, 'dd/MM')}
                                            </>
                                        } 
                                        onRemove={() => updateFilter('dateRange', { start: null, end: null })} 
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Contenu de la liste */}
            <div className="grow min-h-0 bg-background">
                <DetailedTransactionList 
                    transactions={filteredTransactions} 
                    allTransactions={enrichedTransactions}
                    onTransactionClick={handleTransactionClick} 
                />
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

function FilterBadge({ label, onRemove }) {
    return (
        <Badge
            variant="secondary"
            className="h-7 px-2.5 py-0 rounded-lg flex items-center gap-1.5 bg-muted/80 text-foreground border-none font-medium shrink-0 animate-in fade-in zoom-in duration-200"
        >
            <span className="text-[11px] font-bold">{label}</span>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                className="hover:bg-foreground/10 rounded-full p-0.5 transition-colors"
            >
                <X className="h-3 w-3" />
            </button>
        </Badge>
    );
}
