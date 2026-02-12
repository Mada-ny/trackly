import { useAccounts, useCategories } from "@/utils/db/hooks";
import { 
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerClose,
    DrawerFooter,
} from "../ui/drawer";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import DatePicker from "../date/DatePicker";
import { X, TrendingDown, TrendingUp } from "lucide-react";

export default function FilterDrawer({ open, onOpenChange, filters, updateFilter, resetFilters }) {
    const accounts = useAccounts();
    const categories = useCategories();

    const toggleAccount = (accountId) => {
        const newAccountIds = filters.accountIds.includes(accountId)
            ? filters.accountIds.filter(id => id !== accountId)
            : [...filters.accountIds, accountId];
        updateFilter('accountIds', newAccountIds);
    };

    const toggleCategory = (categoryId) => {
        const newCategoryIds = filters.categoryIds.includes(categoryId)
            ? filters.categoryIds.filter(id => id !== categoryId)
            : [...filters.categoryIds, categoryId];
        updateFilter('categoryIds', newCategoryIds);
    };


    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-h-[85vh]">
                <DrawerHeader className="border-b border-gray-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                        <DrawerTitle>Filtrer & Trier</DrawerTitle>
                        <DrawerClose asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <X className="h-4 w-4" />
                            </Button>
                        </DrawerClose>
                    </div>
                    <DrawerDescription className="self-start">Appliquer des filtres et trier les transactions.</DrawerDescription>
                </DrawerHeader>

                <div className="overflow-y-auto px-4 py-6 space-y-6">
                    <div>
                        <Label className="text-base text-gray-700 dark:text-gray-300 mb-3 px-1">
                            Type de transaction
                        </Label>

                        <div className="flex gap-2">
                            {['income', 'expense'].map(type => (
                                <Button
                                    key={type}
                                    variant={filters.type === type ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => updateFilter('type', filters.type === type ? null : type)}
                                    className="flex-1"
                                >
                                    {type === 'income' ? (
                                        <>
                                            <TrendingUp className="w-4 h-4 mr-2" />
                                            Revenus
                                        </>
                                    ) : (
                                        <>
                                            <TrendingDown className="w-4 h-4 mr-2" />
                                            Dépenses
                                        </>
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label className={"text-base text-gray-700 dark:text-gray-300 mb-3 px-1"}>
                            Comptes
                        </Label>

                        <div className="flex flex-wrap gap-2">
                            {accounts.map(account => (
                                <Badge
                                    key={account.id}
                                    variant={filters.accountIds.includes(account.id) ? 'default' : 'secondary'}
                                    className="cursor-pointer px-3 py-1.5 text-sm"
                                    onClick={() => toggleAccount(account.id)}
                                >
                                    {account.name}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label className="text-base text-gray-700 dark:text-gray-300 mb-3 px-1">
                            Catégories
                        </Label>

                        <div className="flex flex-wrap gap-2">
                            {categories.map(category => (
                                <Badge
                                    key={category.id}
                                    variant={filters.categoryIds.includes(category.id) ? 'default' : 'secondary'}
                                    className="cursor-pointer px-3 py-1.5 text-sm"
                                    onClick={() => toggleCategory(category.id)}
                                >
                                    {category.name}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label className="text-base text-gray-700 dark:text-gray-300 mb-3 px-1">
                            Période
                        </Label>

                        <div className="space-y-3">
                            <div>
                                <Label className="text-sm text-gray-500 dark:text-gray-200 mb-1 pl-2">
                                    Date de début
                                </Label>
                                <DatePicker
                                    id="filter-drawer-debut-date-picker"
                                    value={filters.dateRange.start}
                                    maxDate={filters.dateRange.end}
                                    onChange={
                                        date => updateFilter('dateRange', { ...filters.dateRange, start: date })
                                    }
                                />
                            </div>

                            <div>
                                <Label className="text-sm text-gray-500 dark:text-gray-200 mb-1 pl-2">
                                    Date de fin
                                </Label>
                                <DatePicker
                                    id="filter-drawer-fin-date-picker"
                                    value={filters.dateRange.end}
                                    minDate={filters.dateRange.start}
                                    onChange={
                                        date => updateFilter('dateRange', { ...filters.dateRange, end: date })
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label className="text-base text-gray-700 dark:text-gray-300 mb-3 px-1">
                            Montant
                        </Label>

                        <div className="flex gap-2">
                            <Input
                                type="number"
                                placeholder="Minimum"
                                value={filters.amountRange.min ?? ""}
                                inputMode="decimal"
                                onChange={e => {
                                    updateFilter('amountRange', {
                                    ...filters.amountRange,
                                    min: e.target.value
                                    });
                                }}
                                onBlur={() => {
                                    if (
                                        filters.amountRange.min &&
                                        filters.amountRange.max &&
                                        Number(filters.amountRange.max) < Number(filters.amountRange.min)
                                    ) {
                                        toast.error("Le montant minimum ne peut pas être supérieur au maximum.");
                                        updateFilter('amountRange', {
                                            ...filters.amountRange,
                                            min: ""
                                        });
                                    }
                                }}
                            />

                            <Input
                                type="number"
                                placeholder="Maximum"
                                value={filters.amountRange.max ?? ""}
                                inputMode="decimal"
                                onChange={e => {
                                    updateFilter('amountRange', {
                                        ...filters.amountRange,
                                        max: e.target.value
                                    });
                                }}
                                onBlur={() => {
                                    if (
                                        filters.amountRange.min &&
                                        filters.amountRange.max &&
                                        Number(filters.amountRange.max) < Number(filters.amountRange.min)
                                    ) {
                                        toast.error("Le montant maximum ne peut pas être inférieur au minimum.");
                                        updateFilter('amountRange', {
                                            ...filters.amountRange,
                                            max: ""
                                        });
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
                
                <DrawerFooter className="border-t border-gray-200 dark:border-zinc-800 gap-3">
                    <Button onClick={() => onOpenChange(false)} className="w-full">
                        Appliquer les filtres
                    </Button>
                    <Button variant="outline" onClick={resetFilters} className="w-full">
                        Réinitialiser
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}