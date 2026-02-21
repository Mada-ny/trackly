import { NavLink } from "react-router-dom";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { navLinks } from "./navLinks";

export default function DesktopNav() {
    const navLinkClass = ({ isActive }) =>
        `flex items-center justify-center size-12 rounded-full transition-colors ${
            isActive 
                ? "bg-deep-emerald-500 text-white shadow-soft-md" 
                : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
        }`;

    const mainNavLinks = navLinks.filter(link => link.to !== '/settings');
    const settingsLink = navLinks.find(link => link.to === '/settings');

    return (
        <nav className="bg-background/50 backdrop-blur-lg border border-white/20 rounded-3xl mx-auto my-6 p-4 flex flex-col justify-between h-[calc(100vh-3rem)]">

            <div className="flex flex-col items-center gap-8 pt-10">
                {mainNavLinks.map((link) => (
                    <Tooltip key={link.to}>
                        <TooltipTrigger asChild>
                            <NavLink 
                                to={link.to}
                                id={`nav-${link.to === '/' ? 'dashboard' : link.to.replace('/', '')}`}
                                className={navLinkClass}
                            >
                                <link.icon className="size-6" />
                            </NavLink>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                                <p>{link.text}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>

            {settingsLink && (
                <div className="pb-4">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <NavLink 
                                to={settingsLink.to}
                                id="nav-settings"
                                className={navLinkClass}
                            >
                                <settingsLink.icon className="size-6" />
                            </NavLink>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>{settingsLink.text}</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            )}

        </nav>
    )
}