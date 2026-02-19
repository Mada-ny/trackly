import { createContext, useContext, useState, useEffect } from "react";
import LockScreen from "./LockScreen";

const SecurityContext = createContext();

// Fonction utilitaire pour hacher le PIN (SHA-256)
async function hashPin(pin) {
    const msgUint8 = new TextEncoder().encode(pin + "trackly-salt-2026"); // Ajout d'un sel pour plus de robustesse
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function SecurityProvider({ children }) {
    const [isLocked, setIsLocked] = useState(false);
    const [hasPin, setHasPin] = useState(() => !!localStorage.getItem("trackly-pin-hash"));
    const [isSecurityEnabled, setIsSecurityEnabled] = useState(() => localStorage.getItem("trackly-security-enabled") === "true");

    useEffect(() => {
        if (isSecurityEnabled && hasPin) {
            setIsLocked(true);
        }
    }, [isSecurityEnabled, hasPin]);

    const value = {
        isLocked,
        setIsLocked,
        isSecurityEnabled,
        setIsSecurityEnabled: (val) => {
            setIsSecurityEnabled(val);
            localStorage.setItem("trackly-security-enabled", val);
        },
        hasPin,
        setPin: async (pin) => {
            const hash = await hashPin(pin);
            localStorage.setItem("trackly-pin-hash", hash);
            setHasPin(true);
        },
        verifyPin: async (pin) => {
            const hash = await hashPin(pin);
            return hash === localStorage.getItem("trackly-pin-hash");
        },
        removePin: () => {
            localStorage.removeItem("trackly-pin-hash");
            setHasPin(false);
            setIsSecurityEnabled(false);
            localStorage.setItem("trackly-security-enabled", "false");
        }
    };

    return (
        <SecurityContext.Provider value={value}>
            {isLocked ? (
                <LockScreen onUnlock={() => setIsLocked(false)} />
            ) : (
                children
            )}
        </SecurityContext.Provider>
    );
}

export const useSecurity = () => {
    const context = useContext(SecurityContext);
    if (!context) throw new Error("useSecurity must be used within SecurityProvider");
    return context;
};
