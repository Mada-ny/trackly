import { NavLink } from "react-router";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { LayoutDashboard, WalletCards, Settings } from "lucide-react";

export default function DesktopNav() {

    return (
        <nav className="bg-transparent px-4 py-6 flex flex-col justify-between">

            <div className="flex flex-col items-center gap-8 pt-10">
                <Tooltip>
                    <TooltipTrigger>
                        <NavLink 
                            to="/transactions" 
                            className={({ isActive }) =>
                                `flex items-center justify-center size-12 rounded-full transition-colors ${
                                    isActive ? "bg-norway-600 hover:bg-norway-500 text-norway-50" : "bg-norway-100 hover:bg-norway-200 text-norway-600 hover:text-norway-700"
                                }`
                            }
                        >
                            <WalletCards className="size-6" />
                        </NavLink>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                            <p>Transactions</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger>
                        <NavLink 
                            to="/" 
                            className={({ isActive }) =>
                                `flex items-center justify-center size-12 rounded-full transition-colors ${
                                    isActive ? "bg-norway-600 hover:bg-norway-500 text-norway-50" : "bg-norway-100 hover:bg-norway-200 text-norway-600 hover:text-norway-700"
                                }`
                            }
                        >
                            <LayoutDashboard className="size-6" />
                        </NavLink>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                            <p>Dashboard</p>
                    </TooltipContent>
                </Tooltip>
            </div>

            <div>
                <NavLink 
                    to="/settings" 
                    className={({ isActive }) =>
                        `flex items-center justify-center size-12 rounded-full transition-colors ${
                            isActive ? "bg-norway-800 text-norway-50 hover:text-norway-100" : "bg-norway-200 text-norway-700 hover:text-norway-900"
                        }`
                    }
                >
                    <Settings className="size-8" />
                </NavLink>
            </div>

        </nav>
    )
}