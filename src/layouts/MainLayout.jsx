import { Outlet } from "react-router";
import MobileNav from "@/components/navigation/MobileNav";
import DesktopNav from "@/components/navigation/DesktopNav";
import SplashScreen from "@/components/navigation/SplashScreen";
import PageTransition from "@/components/navigation/PageTransition";
import { useState } from "react";
import { useScrollDirection } from "@/utils/navigation/useScrollDirection";
import { cn } from "@/lib/utils";

export default function MainLayout() {
    const desktopNavWidth = "md:w-20"; 
    const scrollDirection = useScrollDirection();
    const [showSplash, setShowSplash] = useState(() => {
        return !sessionStorage.getItem("trackly-splash-shown");
    });

    const handleSplashFinish = () => {
        setShowSplash(false);
        sessionStorage.setItem("trackly-splash-shown", "true");
    };

    return (
        <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background text-foreground overflow-x-hidden">
            {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

            {/* Nav desktop */}
            <aside className={`fixed left-0 top-0 h-screen z-50 hidden md:block ${desktopNavWidth}`}>
                <DesktopNav />
            </aside>

            {/* Contenu principal avec transitions de page */}
            <main className={`flex-1 w-full mx-auto max-w-[500px] md:max-w-full ${desktopNavWidth} md:pl-20 md:pb-4`}>
                <PageTransition>
                    <Outlet />
                </PageTransition>
            </main>

            {/* Nav mobile (Floating Pill) */}
            <footer className={cn(
                "fixed bottom-0 left-0 right-0 z-50 md:hidden pointer-events-none transition-transform duration-500",
                scrollDirection === "down" ? "translate-y-full" : "translate-y-0"
            )}>
                <div className="w-full mx-auto max-w-[500px] pointer-events-auto">
                    <MobileNav />
                </div>
            </footer>
        </div>
    )
}