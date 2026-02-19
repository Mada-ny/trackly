import { useState } from "react";
import { Delete, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSecurity } from "./SecurityProvider";

export default function LockScreen({ onUnlock }) {
    const { verifyPin } = useSecurity();
    const [code, setCode] = useState("");

    const handleNumberClick = async (num) => {
        if (code.length < 4) {
            const newCode = code + num;
            setCode(newCode);
            
            if (newCode.length === 4) {
                const isValid = await verifyPin(newCode);
                if (isValid) {
                    setTimeout(() => onUnlock(), 200);
                } else {
                    toast.error("Code PIN incorrect");
                    setTimeout(() => setCode(""), 500);
                }
            }
        }
    };

    const handleDelete = () => {
        setCode(prev => prev.slice(0, -1));
    };

    return (
        <div className="fixed inset-0 z-100 bg-background flex flex-col items-center justify-center p-6 animate-in fade-in duration-500 overflow-hidden">
            <div className="w-full max-w-xs flex flex-col items-center">
                {/* Header */}
                <div className="flex flex-col items-center gap-4 mb-10">
                    <div className="w-16 h-16 rounded-4xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Lock className="w-8 h-8" />
                    </div>
                    <div className="text-center space-y-1">
                        <h1 className="text-lg font-black uppercase tracking-[0.2em] text-foreground">Trackly</h1>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Saisissez votre code PIN</p>
                    </div>
                </div>

                {/* Indicateurs de points */}
                <div className="flex gap-5 mb-12">
                    {[...Array(4)].map((_, i) => (
                        <div 
                            key={i} 
                            className={cn(
                                "w-3 h-3 rounded-full border-2 border-primary/20 transition-all duration-300",
                                code.length > i ? "bg-primary border-primary scale-125 shadow-[0_0_15px_rgba(var(--primary),0.3)]" : "bg-transparent scale-100"
                            )} 
                        />
                    ))}
                </div>

                {/* Pavé numérique */}
                <div className="grid grid-cols-3 gap-x-8 gap-y-6 w-full place-items-center">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button
                            key={num}
                            onClick={() => handleNumberClick(num.toString())}
                            className="w-16 h-16 rounded-full bg-muted/40 hover:bg-muted text-xl font-black text-foreground active:scale-90 transition-all flex items-center justify-center shadow-sm border border-border/5"
                        >
                            {num}
                        </button>
                    ))}
                    <div className="w-16 h-16" /> {/* Espace vide à gauche du 0 */}
                    <button
                        onClick={() => handleNumberClick("0")}
                        className="w-16 h-16 rounded-full bg-muted/40 hover:bg-muted text-xl font-black text-foreground active:scale-90 transition-all flex items-center justify-center shadow-sm border border-border/5"
                    >
                        0
                    </button>
                    <button
                        onClick={handleDelete}
                        className="w-16 h-16 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-90 transition-all"
                    >
                        <Delete className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
}
