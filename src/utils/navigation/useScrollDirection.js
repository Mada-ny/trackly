import { useState, useEffect } from "react";

export function useScrollDirection() {
    const [scrollDirection, setScrollDirection] = useState("up");
    const [prevOffset, setPrevOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const container = document.querySelector('.overflow-y-auto');
            const currentOffset = container ? container.scrollTop : window.pageYOffset;
            
            // Seuil minimum pour éviter les sauts sur de micro-mouvements
            if (Math.abs(currentOffset - prevOffset) < 10) return;

            const direction = currentOffset > prevOffset ? "down" : "up";
            
            if (direction !== scrollDirection && (currentOffset > 50 || direction === "up")) {
                setScrollDirection(direction);
            }
            
            setPrevOffset(currentOffset);
        };

        // On écoute sur la fenêtre et sur les conteneurs scrollables potentiels
        window.addEventListener("scroll", handleScroll, true);
        return () => window.removeEventListener("scroll", handleScroll, true);
    }, [scrollDirection, prevOffset]);

    return scrollDirection;
}
