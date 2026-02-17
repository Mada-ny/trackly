import { NavLink } from "react-router-dom";
import { navLinks } from "./navLinks";

export default function MobileNav() {

    return (
        <nav className="bg-background/50 backdrop-blur-lg border border-white/20 rounded-t-3xl shadow-soft-lg px-4 py-3 flex justify-around">
            {navLinks.map((link) => (
                <NavLink 
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                        `flex flex-col items-center gap-1 transition-colors ${
                            isActive ? "text-deep-emerald-500" : "text-slate-500 hover:text-deep-emerald-400"
                        }`
                    }
                >
                    <link.icon className="w-6 h-6" />
                    <span className="text-sm font-semibold">{link.text}</span>
                </NavLink>
            ))}
        </nav>
    )
}