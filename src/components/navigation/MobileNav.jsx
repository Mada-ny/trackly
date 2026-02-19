import { NavLink } from "react-router";
import { cn } from "@/lib/utils";
import { navLinks } from "./navLinks";

export default function MobileNav() {
    return (
        <nav className="flex items-center justify-around bg-background/80 backdrop-blur-lg border-t border-border/50 px-2 py-2">
            {navLinks.map((link) => (
                <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                        cn(
                            "flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-300 min-w-16",
                            isActive 
                                ? "text-primary bg-primary/5" 
                                : "text-muted-foreground hover:text-foreground"
                        )
                    }
                >
                    {({ isActive }) => (
                        <>
                            <link.icon className="w-5 h-5 mb-1" strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[9px] font-black uppercase tracking-tighter leading-none">
                                {link.text}
                            </span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
}
