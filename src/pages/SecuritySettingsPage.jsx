import { useState } from "react";
import { BackHeader } from "@/components/navigation/BackHeader";
import { 
    ShieldCheck, 
    Lock, 
    Unlock, 
    ChevronRight,
    CircleDot,
    Delete,
    XCircle
} from "lucide-react";
import { useSecurity } from "@/components/navigation/SecurityProvider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SecuritySettingsPage() {
    const { isSecurityEnabled, setIsSecurityEnabled, hasPin, setPin, removePin } = useSecurity();
    const [step, setStep] = useState("menu"); // menu, set-pin, confirm-pin
    const [tempPin, setTempPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");

    const handlePinClick = (num) => {
        if (step === "set-pin") {
            if (tempPin.length < 4) {
                const newPin = tempPin + num;
                setTempPin(newPin);
                if (newPin.length === 4) {
                    setTimeout(() => setStep("confirm-pin"), 300);
                }
            }
        } else if (step === "confirm-pin") {
            if (confirmPin.length < 4) {
                const newPin = confirmPin + num;
                setConfirmPin(newPin);
                if (newPin.length === 4) {
                    if (newPin === tempPin) {
                        setPin(newPin);
                        setIsSecurityEnabled(true);
                        toast.success("Code PIN configuré et activé");
                        setStep("menu");
                        setTempPin("");
                        setConfirmPin("");
                    } else {
                        toast.error("Les codes ne correspondent pas");
                        setConfirmPin("");
                    }
                }
            }
        }
    };

    const toggleSecurity = () => {
        if (!hasPin) {
            setStep("set-pin");
        } else {
            setIsSecurityEnabled(!isSecurityEnabled);
            toast.success(isSecurityEnabled ? "Verrouillage désactivé" : "Verrouillage activé");
        }
    };

    const handleChangePin = () => {
        setStep("set-pin");
        setTempPin("");
        setConfirmPin("");
    };

    if (step === "set-pin" || step === "confirm-pin") {
        const currentCode = step === "set-pin" ? tempPin : confirmPin;
        return (
            <div className="flex flex-col h-screen bg-background overflow-hidden">
                <BackHeader title="Configurer le PIN" onBack={() => setStep("menu")} />
                <div className="flex flex-col items-center justify-center grow p-6 animate-in slide-in-from-right duration-300">
                    <div className="w-full max-w-xs flex flex-col items-center">
                        <div className="text-center space-y-2 mb-10">
                            <h2 className="text-lg font-black uppercase tracking-[0.15em]">
                                {step === "set-pin" ? "Nouveau code PIN" : "Confirmez le code"}
                            </h2>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                                {step === "set-pin" ? "Choisissez 4 chiffres" : "Saisissez à nouveau le code"}
                            </p>
                        </div>

                        <div className="flex gap-5 mb-12">
                            {[...Array(4)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className={cn(
                                        "w-3 h-3 rounded-full border-2 border-primary/20 transition-all duration-300",
                                        currentCode.length > i ? "bg-primary border-primary scale-125 shadow-[0_0_15px_rgba(var(--primary),0.3)]" : "bg-transparent scale-100"
                                    )} 
                                />
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-x-8 gap-y-6 w-full place-items-center">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <button
                                    key={num}
                                    onClick={() => handlePinClick(num.toString())}
                                    className="w-16 h-16 rounded-full bg-muted/40 hover:bg-muted text-xl font-black text-foreground active:scale-90 transition-all flex items-center justify-center shadow-sm border border-border/5"
                                >
                                    {num}
                                </button>
                            ))}
                            <div className="w-16 h-16" />
                            <button
                                onClick={() => handlePinClick("0")}
                                className="w-16 h-16 rounded-full bg-muted/40 hover:bg-muted text-xl font-black text-foreground active:scale-90 transition-all flex items-center justify-center shadow-sm border border-border/5"
                            >
                                0
                            </button>
                            <button
                                onClick={() => {
                                    if (step === "set-pin") setTempPin(prev => prev.slice(0, -1));
                                    else setConfirmPin(prev => prev.slice(0, -1));
                                }}
                                className="w-16 h-16 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-90 transition-all"
                            >
                                <Delete className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            <BackHeader title="Sécurité" fallback="/settings" />
            <div className="p-4 space-y-8 max-w-2xl mx-auto grow overflow-y-auto no-scrollbar pb-24">
                
                <div className="flex flex-col items-center gap-4 py-8">
                    <div className={cn(
                        "w-20 h-20 rounded-[2.5rem] flex items-center justify-center transition-all duration-500",
                        isSecurityEnabled ? "bg-emerald-500/10 text-emerald-600 rotate-360" : "bg-red-500/10 text-red-600"
                    )}>
                        {isSecurityEnabled ? <ShieldCheck className="w-10 h-10" /> : <Unlock className="w-10 h-10" />}
                    </div>
                    <div className="text-center space-y-1">
                        <h2 className="text-lg font-black uppercase tracking-tight">
                            {isSecurityEnabled ? "Protection Active" : "Protection Désactivée"}
                        </h2>
                        <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                            {isSecurityEnabled 
                                ? "L'accès à vos données est protégé par votre code PIN." 
                                : "N'importe qui peut ouvrir l'application sans restriction."}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Options</h3>
                    <div className="grid gap-3">
                        {/* Activer/Désactiver */}
                        <button
                            onClick={toggleSecurity}
                            className="flex items-center justify-between p-4 bg-white/60 dark:bg-white/2 backdrop-blur-md border border-border/50 rounded-2xl shadow-sm text-left active:scale-[0.98] transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "p-2.5 rounded-xl",
                                    isSecurityEnabled ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                                )}>
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground">Verrouillage par code PIN</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Demander le code au démarrage</p>
                                </div>
                            </div>
                            <div className={cn(
                                "w-10 h-6 rounded-full p-1 transition-colors duration-300",
                                isSecurityEnabled ? "bg-primary" : "bg-muted"
                            )}>
                                <div className={cn(
                                    "w-4 h-4 rounded-full bg-white transition-transform duration-300",
                                    isSecurityEnabled ? "translate-x-4" : "translate-x-0"
                                )} />
                            </div>
                        </button>

                        {/* Changer le PIN */}
                        {hasPin && (
                            <button
                                onClick={handleChangePin}
                                className="flex items-center justify-between p-4 bg-white/60 dark:bg-white/2 backdrop-blur-md border border-border/50 rounded-2xl shadow-sm text-left active:scale-[0.98] transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                        <CircleDot className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">Changer le code PIN</p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-medium">Modifier votre secret actuel</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                            </button>
                        )}

                        {/* Supprimer le PIN */}
                        {hasPin && (
                            <button
                                onClick={() => {
                                    if(confirm("Voulez-vous vraiment supprimer la protection par code PIN ?")) {
                                        removePin();
                                        toast.success("Protection supprimée");
                                    }
                                }}
                                className="flex items-center justify-between p-4 bg-red-500/3 border border-red-500/10 rounded-2xl text-left active:scale-[0.98] transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600">
                                        <XCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-red-600">Supprimer le code PIN</p>
                                        <p className="text-[10px] text-red-500/60 uppercase font-medium">Action irréversible</p>
                                    </div>
                                </div>
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
