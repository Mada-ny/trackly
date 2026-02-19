import { Outlet } from "react-router";
import MobileNav from "@/components/navigation/MobileNav";
import DesktopNav from "@/components/navigation/DesktopNav";
import SplashScreen from "@/components/navigation/SplashScreen";
import PageTransition from "@/components/navigation/PageTransition";
import { useState } from "react";

export default function MainLayout() {
    const desktopNavWidth = "md:w-20"; 
    const [showSplash, setShowSplash] = useState(() => {
        return !sessionStorage.getItem("trackly-splash-shown");
    });

    const handleSplashFinish = () => {
        setShowSplash(false);
        sessionStorage.setItem("trackly-splash-shown", "true");
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
            {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

            {/* Nav desktop */}
            <aside className={`fixed left-0 top-0 h-screen z-50 hidden md:block ${desktopNavWidth}`}>
                <DesktopNav />
            </aside>

            {/* Contenu principal avec transitions de page */}
            <main className={`flex-1 w-full mx-auto max-w-[500px] md:max-w-full ${desktopNavWidth} md:pl-20 pb-20 md:pb-4 overflow-hidden`}>
                <PageTransition>
                    <Outlet />
                </PageTransition>
            </main>

            {/* Nav mobile */}
            <footer className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
                <div className="w-full mx-auto max-w-[500px]">
                    <MobileNav />
                </div>
            </footer>
        </div>
    )
}