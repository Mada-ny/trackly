import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Splash screen affiché au démarrage de l'application.
 * Affiche le logo Trackly avec une animation fluide.
 */
export default function SplashScreen({ onFinish }) {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsVisibleExiting] = useState(false);

    useEffect(() => {
        // Durée d'affichage du splash screen (ex: 2 secondes)
        const timer = setTimeout(() => {
            setIsVisibleExiting(true);
            // On laisse le temps à l'animation de sortie de se terminer
            setTimeout(() => {
                setIsVisible(false);
                onFinish?.();
            }, 500);
        }, 1800);

        return () => clearTimeout(timer);
    }, [onFinish]);

    if (!isVisible) return null;

    return (
        <div className={cn(
            "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ease-in-out",
            isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
            <div className="relative flex flex-col items-center">
                {/* Logo animé */}
                <div className="w-24 h-24 mb-6 animate-in zoom-in-50 duration-700 ease-out">
                    <img 
                        src="/logo.svg" 
                        alt="Trackly Logo" 
                        className="w-full h-full drop-shadow-2xl"
                    />
                </div>
                
                {/* Nom de l'app */}
                <h1 className="text-4xl font-black tracking-tighter text-foreground animate-in slide-in-from-bottom-4 duration-1000 ease-out">
                    Trackly
                </h1>
                
                {/* Loader discret */}
                <div className="mt-8 flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                </div>
            </div>
            
            {/* Pied de page */}
            <div className="absolute bottom-12 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                    Gestion de budget locale-first
                </p>
            </div>
        </div>
    );
}
