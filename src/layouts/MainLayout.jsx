import { Outlet } from "react-router";
import MobileNav from "@/components/navigation/MobileNav";
import DesktopNav from "@/components/navigation/DesktopNav";

export default function MainLayout() {
    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            <div className="fixed left-0 w-full max-w-20 z-50 hidden md:block">
                <DesktopNav />
            </div>
            <div className="flex-1 w-full mx-auto max-w-[500px] md:max-w-full md:ml-20 pb-20 md:pb-4 overflow-y-auto">
                <Outlet />
            </div>
            <div className="fixed bottom-0 w-full mx-auto max-w-[500px] z-50 md:hidden">
                <MobileNav />
            </div>
        </div>
    )
}