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
import { useCategories } from "@/utils/db/hooks";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Tag, TrendingDown, TrendingUp, Search, X } from "lucide-react";
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
import CategoryForm from "@/components/categories/CategoryForm";
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
import { cn } from "@/lib/utils";

export default function CategoriesManagementPage() {
    const categories = useCategories();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    // État de recherche local
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

    const handleAdd = () => {
        setSelectedCategory(null);
        setIsDrawerOpen(true);
    };

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setIsDrawerOpen(true);
    };

    const handleDeleteClick = async (category) => {
        if (category.name === "Transfert") {
            toast.error("Cette catégorie système ne peut pas être supprimée.");
            return;
        }
        
        const count = await db.transactions.where("categoryId").equals(category.id).count();
        if (count > 0) {
            toast.error(`Impossible de supprimer : ${count} transactions utilisent cette catégorie.`);
            return;
        }
        setCategoryToDelete(category);
    };

    const confirmDelete = async () => {
        if (!categoryToDelete) return;
        try {
            await db.categories.delete(categoryToDelete.id);
            toast.success("Catégorie supprimée");
            setCategoryToDelete(null);
        } catch (error) {
            toast.error("Erreur lors de la suppression");
            console.error(error);
        }
    };

    // Filtrage des catégories
    const query = debouncedSearchQuery.toLowerCase();
    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(query) && c.name !== "Transfert"
    );

    const expenseCategories = filteredCategories.filter(c => c.type === "expense");
    const incomeCategories = filteredCategories.filter(c => c.type === "income");

    const hasResults = expenseCategories.length > 0 || incomeCategories.length > 0;

    return (
        <div className="flex flex-col h-screen bg-background">
            <BackHeader 
                title="Mes catégories" 
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
                            <BreadcrumbPage>Mes catégories</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Barre de recherche */}
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        type="text"
                        placeholder="Rechercher une catégorie..."
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
                <div className="space-y-8 max-w-2xl mx-auto">
                    
                    {!hasResults && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground italic">
                                {searchQuery ? "Aucune catégorie ne correspond à votre recherche." : "Aucune catégorie configurée."}
                            </p>
                        </div>
                    )}

                    {/* Dépenses */}
                    {expenseCategories.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <TrendingDown className="w-4 h-4 text-red-500" />
                                <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    Dépenses
                                </h2>
                            </div>
                            <div className="grid gap-2">
                                {expenseCategories.map(category => (
                                    <CategoryItem 
                                        key={category.id} 
                                        category={category} 
                                        onEdit={handleEdit} 
                                        onDelete={handleDeleteClick} 
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Revenus */}
                    {incomeCategories.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    Revenus
                                </h2>
                            </div>
                            <div className="grid gap-2">
                                {incomeCategories.map(category => (
                                    <CategoryItem 
                                        key={category.id} 
                                        category={category} 
                                        onEdit={handleEdit} 
                                        onDelete={handleDeleteClick} 
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerContent>
                    <div className="max-w-2xl mx-auto w-full px-4 pb-8">
                        <DrawerHeader className="px-0">
                            <DrawerTitle>{selectedCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}</DrawerTitle>
                            <DrawerDescription>
                                Personnalisez vos catégories pour mieux analyser vos dépenses.
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="py-4">
                            <CategoryForm 
                                category={selectedCategory} 
                                onSuccess={() => setIsDrawerOpen(false)} 
                            />
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>

            <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer la catégorie ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Voulez-vous vraiment supprimer "{categoryToDelete?.name}" ?
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

function CategoryItem({ category, onEdit, onDelete }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
                <div className={cn(
                    "p-2 rounded-xl shrink-0",
                    category.type === "expense" ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                )}>
                    <Tag className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground leading-tight truncate">
                        {category.name}
                    </p>
                    {category.monthlyLimit && (
                        <p className="text-[10px] text-muted-foreground">
                            Limite: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(category.monthlyLimit)}/mois
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1">
                <Button 
                    variant="ghost" 
                    size="icon-sm" 
                    className="h-8 w-8 rounded-full text-muted-foreground"
                    onClick={() => onEdit(category)}
                >
                    <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon-sm" 
                    className={cn(
                        "h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50",
                        category.name === "Transfert" && "opacity-0 pointer-events-none"
                    )}
                    onClick={() => onDelete(category)}
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </Button>
            </div>
        </div>
    );
}
