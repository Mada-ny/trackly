import { Outlet, useLocation } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import MobileNav from "@/components/navigation/MobileNav";
import DesktopNav from "@/components/navigation/DesktopNav";
import QuickAddSheet from "@/components/transactions/QuickAddSheet";
import WelcomeNamePrompt from "@/components/settings/WelcomeNamePrompt";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function MainLayout() {
    const [quickAddOpen, setQuickAddOpen] = useState(false);
    const { pathname } = useLocation();
    const hideNav = /^\/settings\/(accounts|categories|data)(\/|$)/.test(pathname);

    // Quand la nav flottante + le FAB sont masqués, le toast n'a plus besoin de les éviter
    const toastOffset = hideNav
        ? 'calc(24px + env(safe-area-inset-bottom))'
        : 'calc(100px + env(safe-area-inset-bottom))';

    return (
        <div className="min-h-dvh flex flex-col md:flex-row bg-background text-foreground overflow-x-hidden">
            {/* Desktop sidebar */}
            <aside className="fixed left-0 top-0 h-screen z-50 hidden md:block md:w-20">
                <DesktopNav />
            </aside>

            {/* Main content */}
            <main className={cn(
                "flex-1 w-full mx-auto transition-all duration-300",
                "max-w-[500px] md:max-w-7xl",
                "md:pb-4",
                "px-0 md:pl-28 md:pr-8 lg:pl-32 lg:pr-12"
            )}>
                <Outlet />
            </main>

            {/* Mobile nav */}
            {!hideNav && (
                <footer
                    className="fixed bottom-0 left-0 right-0 z-50 md:hidden pointer-events-none"
                    style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
                >
                    <div className="w-full mx-auto max-w-[500px] pointer-events-auto">
                        <MobileNav onAdd={() => setQuickAddOpen(true)} />
                    </div>
                </footer>
            )}

            <QuickAddSheet open={quickAddOpen} onOpenChange={setQuickAddOpen} />
            <WelcomeNamePrompt />
            <Toaster
                position="bottom-center"
                offset={{ bottom: toastOffset }}
                mobileOffset={{ bottom: toastOffset }}
            />
        </div>
    );
}
