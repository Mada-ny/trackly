import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * Composant wrapper pour animer l'entrée des pages.
 * Utilise tailwindcss-animate pour un effet fluide.
 */
export default function PageTransition({ children, className }) {
    const { pathname } = useLocation();

    return (
        <div
            key={pathname} // La clé force le re-montage et donc l'animation à chaque changement de route
            className={cn(
                "w-full h-full animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out",
                className
            )}
        >
            {children}
        </div>
    );
}
