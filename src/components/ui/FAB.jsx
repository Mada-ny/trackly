import { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "./button";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function FAB({ to = "/transactions/new" }) {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [show, setShow] = useState(true);
    const lastScrollY = useRef(0);
    const ticking = useRef(false);
    const timeoutRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
    
            if (!ticking.current) {
                window.requestAnimationFrame(() => {
                    const diff = currentScrollY - lastScrollY.current;
            
                    if (Math.abs(diff) > 15) {
                        setShow(diff < 0);
                        lastScrollY.current = currentScrollY;
                    }
            
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = setTimeout(() => {
                        setShow(true);
                    }, 350);
            
                    ticking.current = false;
                });
                ticking.current = true;
            }
        };
    
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <Button
            onClick={() => 
                navigate(to, { 
                    state: { from: location.pathname + location.search } 
                })
            }
            variant="default"
            size="icon-lg"
            aria-label="Ajouter une transaction"
            className={cn(
                "fixed bg-primary text-primary-foreground shadow-soft-xl rounded-full bottom-24 right-6 z-50 md:bottom-8",
                "transition-all duration-300 ease-out will-change-transform hover:scale-105 active:scale-95",
                show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            )}
        >
            <Plus className="w-6 h-6" />
        </Button>
    );
}