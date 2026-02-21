import { 
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose,
} from "../ui/drawer";
import { 
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Calendar, CreditCard, Tag, Edit3, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AmountDisplay } from "@/components/ui/amount-display";
import { useState } from "react";

export default function TransactionDetailDrawer({ 
    open, 
    onOpenChange, 
    transaction, 
    onEdit, 
    onDelete 
}) {
    const [isCompact, setIsCompact] = useState(false);

    if (!transaction) return null;
    
    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="px-4 pb-8">
                <DrawerHeader className="pt-6 pb-2 text-center space-y-0">
                    <DrawerTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {transaction.description}
                    </DrawerTitle>
                
                    <div
                        className={`text-3xl font-bold flex items-center justify-center cursor-pointer select-none ${
                        transaction.isIncome
                            ? "text-teal-600 dark:text-teal-400"
                            : "text-orange-600 dark:text-orange-400"
                        }`}
                        onClick={() => setIsCompact(!isCompact)}
                    >
                        <div className="flex items-center">
                            <span>{transaction.isIncome ? '+' : '-'}</span>
                            <AmountDisplay 
                                amount={Math.abs(transaction.amount)} 
                                compact={isCompact}
                                className="text-3xl font-bold"
                            />
                        </div>
                    </div>
                </DrawerHeader>

                <div className="px-6 py-6 space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-zinc-900">
                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Date</div>
                            <div className="font-medium text-gray-900 dark:text-white capitalize">
                                {format(transaction.date, "EEEE dd MMMM yyyy", { locale: fr })}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-zinc-900">
                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0">
                            <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Compte</div>
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                                {transaction.account?.name}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-zinc-900">
                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0">
                            <Tag className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Catégorie</div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {transaction.category?.name}
                                </span>
                                <Badge 
                                    variant="secondary" 
                                    className={
                                        transaction.isIncome
                                        ? 'bg-teal-100 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300'
                                        : 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300'
                                    }
                                >
                                    {transaction.isIncome ? "Revenu" : "Dépense"}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <DrawerFooter className="px-6 pb-8 pt-2 gap-3">
                    <Button
                        size="lg"
                        className="w-full"
                        onClick={() => {
                            onEdit(transaction);
                            onOpenChange(false);
                        }}
                    >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Modifier l'opération
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="destructive"
                                size="lg"
                                className="w-full"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Cette action est irréversible et supprimera définitivement l'opération "{transaction.description}".
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction 
                                    onClick={() => {
                                        onDelete(transaction.id);
                                        onOpenChange(false);
                                    }}
                                    variant="destructive"
                                >
                                    Supprimer
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                
                    <DrawerClose asChild>
                        <Button variant="outline" size="lg" className="w-full">
                            Fermer
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}