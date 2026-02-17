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
import { Plus, Edit2, Trash2, Wallet } from "lucide-react";
import { useState } from "react";
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

/**
 * Page de gestion des comptes.
 * Permet de lister, ajouter, modifier et supprimer des sources d'argent.
 */
export default function AccountsManagementPage() {
    const accounts = useAccounts();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [accountToDelete, setAccountToDelete] = useState(null);

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
                    <Button onClick={handleAdd} size="sm" className="rounded-full gap-1.5 h-9 px-4">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Nouveau</span>
                    </Button>
                }
            />
            
            <div className="px-4 py-3 shrink-0">
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
            </div>

            <div className="grow overflow-y-auto no-scrollbar p-4 pb-24">
                <div className="grid gap-3 max-w-2xl mx-auto">
                    {accounts.map(account => (
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
                                        Solde initial: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(account.initialBalance)}
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

                    {accounts.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground italic">Aucun compte configuré.</p>
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
