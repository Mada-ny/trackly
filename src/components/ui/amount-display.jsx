import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from "@/utils/number/CurrencyProvider";
import { cn } from "@/lib/utils";

/**
 * Composant pour afficher un montant avec support du marquee si trop long
 * et intégration du formatage de devise.
 */
export function AmountDisplay({ 
    amount, 
    compact = false, 
    currency = 'XOF',
    className,
    containerClassName,
    showMarquee = true,
    onClick,
    ...props
}) {
    const { formatCurrency } = useCurrency();
    const formatted = formatCurrency(amount, { compact, currency });
    
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [scrollAmount, setScrollAmount] = useState('0px');
    const containerRef = useRef(null);
    const textRef = useRef(null);

    // Détection du dépassement et calcul de la distance de défilement
    useEffect(() => {
        const checkOverflow = () => {
            if (!compact && containerRef.current && textRef.current) {
                const containerWidth = containerRef.current.clientWidth;
                const textWidth = textRef.current.scrollWidth;
                const overflowing = textWidth > containerWidth;
                setIsOverflowing(overflowing);
                
                if (overflowing) {
                    // On décale de la différence + un petit padding
                    setScrollAmount(`-${textWidth - containerWidth + 4}px`);
                }
            } else {
                setIsOverflowing(false);
            }
        };

        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
    }, [amount, compact, formatted]);

    return (
        <div 
            ref={containerRef}
            className={cn(
                "marquee-container select-none", 
                onClick && "cursor-pointer",
                containerClassName
            )}
            onClick={onClick}
            {...props}
        >
            <span 
                ref={textRef}
                style={{ '--scroll-amount': scrollAmount }}
                className={cn(
                    "inline-block tabular-nums whitespace-nowrap",
                    showMarquee && isOverflowing && "animate-marquee",
                    className
                )}
            >
                {formatted}
            </span>
        </div>
    );
}
