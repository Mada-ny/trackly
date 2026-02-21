import { BackHeader } from "@/components/navigation/BackHeader";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { useAccounts } from "@/utils/db/hooks";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Wallet, Search, X } from "lucide-react";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { 
    Drawer, 
    DrawerContent, 
    DrawerHeader, 
    DrawerTitle, 
    DrawerDescription 
} from "@/components/ui/drawer";
import AccountForm from "@/components/accounts/AccountForm";
import { db } from "@/utils/db/schema";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCurrency } from "@/utils/number/CurrencyProvider";

export default function AccountsManagementPage() {
    const accounts = useAccounts();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [accountToDelete, setAccountToDelete] = useState(null);
    const { formatCurrency } = useCurrency();

    // État de recherche local
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

    // Filtrage des comptes
    const filteredAccounts = accounts.filter(account => 
        account.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );

    // Ouvre le formulaire pour un nouveau compte
    const handleAdd = () => {
        setSelectedAccount(null);
        setIsDrawerOpen(true);
    };

    // Ouvre le formulaire pour modifier un compte existant
    const handleEdit = (account) => {
        setSelectedAccount(account);
        setIsDrawerOpen(true);
    };

    // Vérifie si le compte peut être supprimé (pas de transactions liées)
    const handleDeleteClick = async (account) => {
        const count = await db.transactions.where("accountId").equals(account.id).count();
        if (count > 0) {
            toast.error(`Impossible de supprimer ce compte : il contient ${count} transactions.`);
            return;
        }
        setAccountToDelete(account);
    };

    // Procède à la suppression effective
    const confirmDelete = async () => {
        if (!accountToDelete) return;
        try {
            await db.accounts.delete(accountToDelete.id);
            toast.success("Compte supprimé");
            setAccountToDelete(null);
        } catch (error) {
            toast.error("Erreur lors de la suppression");
            console.error(error);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            <BackHeader 
                title="Mes comptes" 
                fallback="/settings" 
                action={
                    <Button 
                        onClick={handleAdd} 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full h-9 w-9"
                    >
                        <Plus className="w-6 h-6 text-foreground" />
                    </Button>
                }
            />
            
            <div className="px-4 py-3 shrink-0 space-y-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link to="/settings">Paramètres</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Mes comptes</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Barre de recherche */}
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        type="text"
                        placeholder="Rechercher un compte..."
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
            </div>

            <div className="grow overflow-y-auto no-scrollbar p-4 pb-24">
                <div className="grid gap-3 max-w-2xl mx-auto">
                    {filteredAccounts.map(account => (
                        <div 
                            key={account.id}
                            className="flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                                    <Wallet className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-foreground leading-tight truncate">
                                        {account.name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                        Solde initial: {formatCurrency(account.initialBalance)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <Button 
                                    variant="ghost" 
                                    size="icon-sm" 
                                    className="h-8 w-8 rounded-full text-muted-foreground"
                                    onClick={() => handleEdit(account)}
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon-sm" 
                                    className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleDeleteClick(account)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {filteredAccounts.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground italic">
                                {searchQuery ? "Aucun compte ne correspond à votre recherche." : "Aucun compte configuré."}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Formulaire d'ajout/modification dans un tiroir mobile-friendly */}
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerContent>
                    <div className="max-w-2xl mx-auto w-full px-4 pb-8">
                        <DrawerHeader className="px-0">
                            <DrawerTitle>{selectedAccount ? "Modifier le compte" : "Nouveau compte"}</DrawerTitle>
                            <DrawerDescription>
                                {selectedAccount 
                                    ? "Modifiez le nom ou le solde initial de votre compte." 
                                    : "Ajoutez un nouveau compte pour suivre vos dépenses."}
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="py-4">
                            <AccountForm 
                                account={selectedAccount} 
                                onSuccess={() => setIsDrawerOpen(false)} 
                            />
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>

            {/* Confirmation de suppression */}
            <AlertDialog open={!!accountToDelete} onOpenChange={(open) => !open && setAccountToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer le compte ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer le compte "{accountToDelete?.name}" ? 
                            Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
