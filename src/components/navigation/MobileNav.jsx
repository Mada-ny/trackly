import { NavLink } from "react-router";
import { LayoutDashboard, WalletCards, Settings } from "lucide-react";

export default function MobileNav() {

    return (
        <nav className="bg-norway-50 border-t border-norway-200 shadow-md px-4 py-3 flex justify-around">
            <NavLink 
                to="/transactions" 
                className={({ isActive }) =>
                    `flex flex-col items-center gap-1 ${
                        isActive ? "text-norway-600" : "text-gray-400"
                    }`
                }
            >
                <WalletCards className="w-6 h-6" />
                <span className="text-sm font-semibold">Transactions</span>
            </NavLink>

            <NavLink 
                to="/" 
                className={({ isActive }) =>
                    `flex flex-col items-center gap-1 ${
                        isActive ? "text-norway-600" : "text-gray-400"
                    }`
                }
            >
                <LayoutDashboard className="w-6 h-6" />
                <span className="text-sm font-semibold">Dashboard</span>
            </NavLink>

            <NavLink 
                to="/settings" 
                className={({ isActive }) =>
                    `flex flex-col items-center gap-1 ${
                        isActive ? "text-norway-600" : "text-gray-400"
                    }`
                }
            >
                <Settings className="w-6 h-6" />
                <span className="text-sm font-semibold">Paramètres</span>
            </NavLink>
        </nav>
    )
}