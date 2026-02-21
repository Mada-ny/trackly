import { 
    WalletCards, 
    Tags, 
    Database, 
    ChevronRight,
    User,
    Info,
    Moon,
    Sun,
    Monitor,
    Coins,
    Palette,
    Layers,
    Shield,
    Smartphone,
    Heart,
    Github,
    ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ui/theme-provider";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/utils/number/CurrencyProvider";
import { useState } from "react";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { currency, setCurrency, supportedCurrencies } = useCurrency();
    const [isAboutOpen, setIsAboutOpen] = useState(false);

    const sections = [
        {
            title: "Organisation",
            icon: Layers,
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
            icon: Shield,
            items: [
                {
                    label: "Données & Sauvegarde",
                    icon: Database,
                    description: "Exporter ou importer vos données JSON",
                    to: "/settings/data",
                    color: "text-amber-500",
                    bg: "bg-amber-500/10"
                }
            ]
        },
        {
            title: "Application",
            icon: Smartphone,
            items: [
                {
                    label: "À propos",
                    icon: Info,
                    description: "Version 1.1.0 - Trackly",
                    onClick: () => setIsAboutOpen(true),
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
                    
                    {/* Sélecteur de Devise */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <Coins className="w-3 h-3 text-muted-foreground" />
                            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Devise principale
                            </h2>
                        </div>
                        <div className="flex p-1 gap-1 bg-muted/50 rounded-2xl border border-border/50 backdrop-blur-sm">
                            {supportedCurrencies.map((opt) => (
                                <button
                                    key={opt.code}
                                    onClick={() => setCurrency(opt.code)}
                                    className={cn(
                                        "flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all",
                                        currency === opt.code 
                                            ? "bg-background text-primary shadow-sm ring-1 ring-border/50" 
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <span className="text-sm font-black">{opt.symbol}</span>
                                    <span className="text-[9px] font-bold uppercase tracking-tighter">
                                        {opt.code}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sélecteur de Thème */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <Palette className="w-3 h-3 text-muted-foreground" />
                            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Apparence
                            </h2>
                        </div>
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
                            <div className="flex items-center gap-2 px-1">
                                <section.icon className="w-3 h-3 text-muted-foreground" />
                                <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    {section.title}
                                </h2>
                            </div>
                            <div className="grid gap-2">
                                {section.items.map((item, itemIdx) => {
                                    const content = (
                                        <>
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
                                            {item.to && <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />}
                                        </>
                                    );

                                    if (item.onClick) {
                                        return (
                                            <button
                                                key={itemIdx}
                                                onClick={item.onClick}
                                                className="flex items-center gap-4 p-3 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm active:scale-[0.98] transition-all text-left w-full"
                                            >
                                                {content}
                                            </button>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={itemIdx}
                                            to={item.to}
                                            state={{ from: "/settings" }}
                                            className={cn(
                                                "flex items-center gap-4 p-3 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm active:scale-[0.98] transition-all",
                                                item.disabled && "opacity-50 pointer-events-none"
                                            )}
                                        >
                                            {content}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal À Propos */}
            <Drawer open={isAboutOpen} onOpenChange={setIsAboutOpen}>
                <DrawerContent>
                    <div className="mx-auto w-full max-w-sm">
                        <DrawerHeader className="items-center text-center pt-8">
                            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
                                <img src="/logo.svg" alt="Trackly Logo" className="w-12 h-12" />
                            </div>
                            <DrawerTitle className="text-2xl font-black tracking-[0.2em] uppercase">Trackly</DrawerTitle>
                            <DrawerDescription className="text-xs font-bold uppercase tracking-widest text-primary/60">Version 1.1.0</DrawerDescription>
                        </DrawerHeader>
                        
                        <div className="p-6 space-y-6">
                            <p className="text-sm text-center leading-relaxed text-muted-foreground font-medium">
                                Trackly est une application de gestion de budget <span className="font-bold text-primary/80">Local-First</span>. 
                                Vos données ne quittent jamais votre appareil, garantissant une confidentialité totale.
                            </p>

                            <div className="grid gap-3">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
                                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-tight">100% Hors-ligne</p>
                                        <p className="text-[10px] text-muted-foreground">Données stockées dans IndexedDB</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
                                    <div className="p-2 rounded-xl bg-red-500/10 text-red-600">
                                        <Heart className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-tight">Open Source</p>
                                        <p className="text-[10px] text-muted-foreground">Créé avec passion par Madany Doumbia</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DrawerFooter className="pt-2 pb-10">
                            <DrawerClose asChild>
                                <Button variant="outline" className="w-full rounded-2xl h-12 font-bold uppercase tracking-widest text-xs">Fermer</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
