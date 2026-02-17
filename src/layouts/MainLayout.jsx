import { Outlet } from "react-router";
import MobileNav from "@/components/navigation/MobileNav";
import DesktopNav from "@/components/navigation/DesktopNav";

export default function MainLayout() {
    const desktopNavWidth = "md:w-20"; // Corresponds to w-full max-w-20 in DesktopNav's container

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Nav desktop */}
            <aside className={`fixed left-0 top-0 h-screen z-50 hidden md:block ${desktopNavWidth}`}>
                <DesktopNav />
            </aside>

            {/* Contenu principal */}
            <main className={`flex-1 w-full mx-auto max-w-[500px] md:max-w-full ${desktopNavWidth} md:pl-20 pb-20 md:pb-4`}>
                <Outlet />
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