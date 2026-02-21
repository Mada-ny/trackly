import { NavLink } from "react-router";
import { cn } from "@/lib/utils";
import { navLinks } from "./navLinks";

export default function MobileNav() {
    return (
        <nav className="flex items-center justify-around bg-background/60 backdrop-blur-xl border border-white/20 dark:border-white/10 p-1.5 rounded-4xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] mx-4 mb-4">
            {navLinks.map((link) => (
                <NavLink
                    key={link.to}
                    to={link.to}
                    id={`nav-${link.to === '/' ? 'dashboard' : link.to.replace('/', '')}`}
                    className={({ isActive }) =>
                        cn(
                            "flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-[1.5rem] transition-all duration-300 min-w-[70px] max-w-[90px]",
                            isActive 
                                ? "text-primary bg-primary/10 shadow-inner" 
                                : "text-muted-foreground hover:text-foreground active:scale-95"
                        )
                    }
                >
                    {({ isActive }) => (
                        <>
                            <link.icon className="w-5 h-5 mb-1 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[8px] font-black uppercase tracking-tighter leading-[1.1] text-center w-full wrap-break-word">
                                {link.text}
                            </span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
}
