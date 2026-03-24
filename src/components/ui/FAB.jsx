import { Plus, ArrowRightLeft, Coins, X } from "lucide-react";
import { Button } from "./button";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useScrollDirection } from "@/utils/navigation/useScrollDirection";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { useState } from "react";

export function FAB() {
    const navigate = useNavigate();
    const location = useLocation();
    const scrollDirection = useScrollDirection();
    const [open, setOpen] = useState(false);

    const handleNavigate = (to) => {
        setOpen(false);
        navigate(to, { 
            state: { from: location.pathname + location.search } 
        });
    };

    const isHidden = scrollDirection === "down";

    return (
        <div className={cn(
            "fixed right-6 z-50 transition-all duration-500 ease-in-out md:bottom-8",
            // Position mobile : au-dessus de la barre de navigation pill
            "bottom-24",
            isHidden ? "opacity-0 translate-y-20 scale-90 pointer-events-none" : "opacity-100 translate-y-0 scale-100"
        )}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="tour-fab-button"
                        variant="default"
                        size="icon-lg"
                        className={cn(
                            "w-13 h-13 rounded-full shadow-2xl transition-all duration-300 active:scale-90 bg-primary text-primary-foreground",
                            open && "rotate-45 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/90 dark:text-emerald-300 dark:hover:bg-emerald-800 shadow-none border border-emerald-500/30"
                        )}
                        aria-label="Ouvrir le menu d'ajout"
                    >
                        {open ? <X className="w-5.5 h-5.5 -rotate-45" /> : <Plus className="w-6.5 h-6.5" />}
                    </Button>
                </PopoverTrigger>
                <PopoverContent 
                    side="top" 
                    align="end" 
                    sideOffset={12}
                    className="w-56 p-2 rounded-3xl border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                >
                    <div className="flex flex-col gap-1">
                        <button
                            onClick={() => handleNavigate("/transactions/new")}
                            className="flex items-center gap-3 w-full p-3.5 rounded-2xl hover:bg-primary/10 active:bg-primary/20 transition-colors text-left group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Coins className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-foreground">Transaction</span>
                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Dépense ou Revenu</span>
                            </div>
                        </button>

                        <div className="h-px bg-border/50 mx-2 my-1" />

                        <button
                            onClick={() => handleNavigate("/transactions/transfer")}
                            className="flex items-center gap-3 w-full p-3.5 rounded-2xl hover:bg-primary/10 active:bg-primary/20 transition-colors text-left group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ArrowRightLeft className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-foreground">Virement</span>
                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Entre vos comptes</span>
                            </div>
                        </button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
