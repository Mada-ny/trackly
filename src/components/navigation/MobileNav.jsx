import { NavLink } from "react-router";
import { Home, List, Plus, BarChart3, Settings } from "lucide-react";

const NAV_ITEMS_LEFT = [
    { to: '/',             label: 'Accueil',      icon: Home,     end: true  },
    { to: '/transactions', label: 'Transactions', icon: List,     end: false },
];

const NAV_ITEMS_RIGHT = [
    { to: '/reports',  label: 'Rapports', icon: BarChart3, end: false },
    { to: '/settings', label: 'Réglages', icon: Settings,  end: false },
];

export default function MobileNav({ onAdd }) {
    return (
        <nav
            style={{
                padding: '0 16px 30px',
                background: 'linear-gradient(to top, var(--paper) 55%, transparent)',
                pointerEvents: 'none',
            }}
        >
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    alignItems: 'center',
                    background: 'var(--nav-bg)',
                    backdropFilter: 'blur(18px) saturate(140%)',
                    WebkitBackdropFilter: 'blur(18px) saturate(140%)',
                    border: '1px solid var(--line)',
                    borderRadius: 26,
                    padding: '8px 6px',
                    boxShadow: '0 12px 34px rgba(40,34,24,0.10)',
                    pointerEvents: 'auto',
                }}
            >
                {NAV_ITEMS_LEFT.map(item => (
                    <NavItem key={item.to} {...item} />
                ))}

                {/* Center elevated + button */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                        onClick={onAdd}
                        aria-label="Ajouter une transaction"
                        style={{
                            width: 50,
                            height: 50,
                            borderRadius: 18,
                            border: 'none',
                            cursor: 'pointer',
                            background: 'var(--pine)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 20px rgba(44,84,72,0.34)',
                            marginTop: -22,
                            transition: 'transform .15s ease',
                        }}
                        onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.93)'; }}
                        onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                        onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.93)'; }}
                        onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                        <Plus size={24} strokeWidth={2.2} />
                    </button>
                </div>

                {NAV_ITEMS_RIGHT.map(item => (
                    <NavItem key={item.to} {...item} />
                ))}
            </div>
        </nav>
    );
}

function NavItem({ to, icon: Icon, label, end }) {
    return (
        <NavLink
            to={to}
            end={end}
            style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center' }}
        >
            {({ isActive }) => (
                <span
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        color: isActive ? 'var(--pine)' : 'var(--ink-muted)',
                        padding: '4px 0',
                        width: '100%',
                    }}
                >
                    <Icon size={22} strokeWidth={isActive ? 2.1 : 1.7} />
                    <span style={{
                        fontSize: 10.5,
                        fontWeight: isActive ? 650 : 520,
                        letterSpacing: 0.1,
                        fontFamily: 'var(--sans)',
                        color: 'inherit',
                    }}>
                        {label}
                    </span>
                </span>
            )}
        </NavLink>
    );
}
