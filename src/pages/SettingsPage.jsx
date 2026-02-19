import { 
    WalletCards, 
    Tags, 
    Database, 
    ChevronRight,
    User,
    Info,
    ShieldCheck,
    Moon,
    Sun,
    Monitor
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ui/theme-provider";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();

    const sections = [
        {
            title: "Organisation",
            items: [
                {
                    label: "Mes Comptes",
                    icon: WalletCards,
                    description: "Gérer vos sources d'argent et soldes",
                    to: "/settings/accounts",
                    color: "text-blue-500",
                    bg: "bg-blue-500/10"
                },
                {
                    label: "Mes Catégories",
                    icon: Tags,
                    description: "Budgets et types de transactions",
                    to: "/settings/categories",
                    color: "text-purple-500",
                    bg: "bg-purple-500/10"
                }
            ]
        },
        {
            title: "Sécurité & Données",
            items: [
                {
                    label: "Données & Sauvegarde",
                    icon: Database,
                    description: "Exporter ou importer vos données JSON",
                    to: "/settings/data",
                    color: "text-amber-500",
                    bg: "bg-amber-500/10"
                },
                {
                    label: "Verrouillage local",
                    icon: ShieldCheck,
                    description: "Protéger l'accès par code PIN",
                    to: "/settings/security",
                    color: "text-emerald-500",
                    bg: "bg-emerald-500/10"
                }
            ]
        },
        {
            title: "Application",
            items: [
                {
                    label: "À propos",
                    icon: Info,
                    description: "Version 1.0.0 - Trackly",
                    to: "#",
                    color: "text-slate-500",
                    bg: "bg-slate-500/10"
                }
            ]
        }
    ];

    const themeOptions = [
        { value: "light", label: "Clair", icon: Sun },
        { value: "dark", label: "Sombre", icon: Moon },
        { value: "system", label: "Système", icon: Monitor },
    ];

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* En-tête */}
            <div className="shrink-0 bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-30">
                <div className="px-4 pt-6 pb-4">
                    <h1 className="text-2xl font-black tracking-tight text-foreground">
                        Paramètres
                    </h1>
                    <p className="text-xs font-medium text-muted-foreground">
                        Configuration de votre espace
                    </p>
                </div>
            </div>

            {/* Contenu */}
            <div className="grow overflow-y-auto no-scrollbar pb-24">
                <div className="p-4 space-y-8 max-w-2xl mx-auto">
                    
                    {/* Sélecteur de Thème */}
                    <div className="space-y-3">
                        <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                            Apparence
                        </h2>
                        <div className="flex p-1 gap-1 bg-muted/50 rounded-2xl border border-border/50 backdrop-blur-sm">
                            {themeOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setTheme(option.value)}
                                    className={cn(
                                        "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all",
                                        theme === option.value 
                                            ? "bg-background text-primary shadow-sm ring-1 ring-border/50" 
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <option.icon className="w-5 h-5" />
                                    <span className="text-[10px] font-bold uppercase tracking-tighter">
                                        {option.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {sections.map((section, idx) => (
                        <div key={idx} className="space-y-3">
                            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                                {section.title}
                            </h2>
                            <div className="grid gap-2">
                                {section.items.map((item, itemIdx) => (
                                    <Link
                                        key={itemIdx}
                                        to={item.to}
                                        state={{ from: "/settings" }}
                                        className={cn(
                                            "flex items-center gap-4 p-3 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm active:scale-[0.98] transition-all",
                                            item.disabled && "opacity-50 pointer-events-none"
                                        )}
                                    >
                                        <div className={cn("p-2 rounded-xl shrink-0", item.bg, item.color)}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <div className="grow min-w-0">
                                            <p className="text-sm font-bold text-foreground leading-none mb-1">
                                                {item.label}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground truncate">
                                                {item.description}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
