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
import { Button } from "@/components/ui/button";
import { Download, Upload, Trash2, AlertTriangle, Database } from "lucide-react";
import { exportDatabase, importDatabase } from "@/utils/db/importExport";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { db } from "@/utils/db/schema";

/**
 * Page de gestion des données.
 * Permet d'exporter, d'importer et de réinitialiser les données de l'application.
 */
export default function DataManagementPage() {
    const fileInputRef = useRef(null);
    const [isImporting, setIsImporting] = useState(false);

    // Déclenche l'exportation
    const handleExport = async () => {
        try {
            await exportDatabase();
            toast.success("Données exportées avec succès.");
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'exportation.");
        }
    };

    // Déclenche l'importation via le sélecteur de fichier
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    // Traite le fichier sélectionné pour l'import
    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const content = e.target?.result;
                const data = JSON.parse(content);
                
                await importDatabase(data, true); // On écrase tout pour la restauration
                toast.success("Données importées avec succès !");
                // On recharge la page pour rafraîchir tous les hooks
                setTimeout(() => window.location.reload(), 1000);
            } catch (error) {
                console.error(error);
                toast.error("Échec de l'import : Format de fichier invalide.");
            } finally {
                setIsImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };

        reader.readAsText(file);
    };

    // Réinitialise complètement l'application
    const handleReset = async () => {
        try {
            await db.transaction("rw", [db.accounts, db.categories, db.transactions], async () => {
                await db.transactions.clear();
                await db.categories.clear();
                await db.accounts.clear();
            });
            // Dexie on("populate") ne se redéclenchera pas si on vide juste. 
            // On pourrait supprimer la DB mais c'est violent. 
            // Pour ce projet, on va juste vider et laisser l'utilisateur recréer ou re-populate manuellement si besoin.
            // Mais le plus simple pour un reset "propre" est de supprimer la DB.
            await db.delete();
            toast.success("Application réinitialisée.");
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la réinitialisation.");
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            <BackHeader 
                title="Données & Sauvegarde" 
                description="Exportez et importez vos données locales"
                fallback="/settings" 
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
                            <BreadcrumbPage>Données & Sauvegarde</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="grow overflow-y-auto no-scrollbar p-4 space-y-6 max-w-2xl mx-auto pb-24">
                
                {/* Section Export */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Download className="w-5 h-5 text-blue-500" />
                            Exporter mes données
                        </CardTitle>
                        <CardDescription>
                            Téléchargez une sauvegarde de toutes vos transactions, comptes et catégories au format JSON.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleExport} className="w-full gap-2 rounded-xl">
                            <Download className="w-4 h-4" />
                            Générer une sauvegarde
                        </Button>
                    </CardContent>
                </Card>

                {/* Section Import */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Upload className="w-5 h-5 text-amber-500" />
                            Importer une sauvegarde
                        </CardTitle>
                        <CardDescription>
                            Restaurez vos données à partir d'un fichier précédemment exporté. <br/>
                            <span className="text-red-500 font-bold">Attention : Cela écrasera vos données actuelles.</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept=".json" 
                            className="hidden" 
                        />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="w-full gap-2 rounded-xl border-amber-500/20 text-amber-600 hover:bg-amber-500/10">
                                    <Upload className="w-4 h-4" />
                                    {isImporting ? "Importation..." : "Charger un fichier JSON"}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-red-500" />
                                        Confirmer l'importation
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Cette action est irréversible. Toutes vos transactions actuelles seront supprimées et remplacées par le contenu du fichier.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleImportClick} className="bg-amber-600 hover:bg-amber-700">
                                        Continuer
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>

                {/* Section Reset */}
                <div className="pt-8 border-t border-border/50">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1 mb-3">
                        Zone de danger
                    </h3>
                    <Card className="border-red-500/20 bg-red-500/5 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold text-red-600 flex items-center gap-2">
                                <Trash2 className="w-4 h-4" />
                                Réinitialiser l'application
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Supprime définitivement toutes les données. L'application reviendra à son état initial.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" className="w-full text-red-600 hover:bg-red-500/10 rounded-xl text-xs font-bold h-9">
                                        Effacer tout le contenu
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Suppression totale ?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Voulez-vous vraiment supprimer toutes vos données ? Cette action ne peut pas être annulée.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleReset} className="bg-red-600 hover:bg-red-700">
                                            Réinitialiser
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
