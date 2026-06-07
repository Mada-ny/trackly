import {
    ShoppingBag, Car, Home, Sparkles, Briefcase, Repeat2, Heart, BookOpen,
    ArrowLeftRight, Wallet, CreditCard, Smartphone, TrendingUp, TrendingDown,
    PiggyBank, Target, Flame, Bell,
} from 'lucide-react';

// Glyph picker options (account/category forms) → Lucide icon
// Shared keys with the design reference's GlyphPicker option lists
export const GLYPH_ICONS = {
    wallet: Wallet,
    card: CreditCard,
    phone: Smartphone,
    piggy: PiggyBank,
    briefcase: Briefcase,
    bag: ShoppingBag,
    car: Car,
    home: Home,
    sparkle: Sparkles,
    repeat: Repeat2,
    heart: Heart,
    book: BookOpen,
    target: Target,
    flame: Flame,
    bell: Bell,
};

export const ACCOUNT_GLYPH_OPTIONS = ['wallet', 'card', 'phone', 'piggy', 'briefcase'];
export const ACCOUNT_KINDS = ['Liquide', 'Carte', 'Mobile', 'Épargne'];
export const CATEGORY_GLYPH_OPTIONS = ['bag', 'car', 'home', 'sparkle', 'briefcase', 'repeat', 'heart', 'book', 'target', 'flame', 'piggy', 'bell'];

export const SWATCHES = ['#3f6f63', '#5b76b0', '#b08a4f', '#b4623f', '#8c6a9e', '#b06a7a', '#4f8a86', '#9a8f7d'];

// Map category names (from Dexie default seed) to design visuals — fallback when no custom glyph/color is stored
const CATEGORY_VISUALS = {
    'Alimentation':  { icon: ShoppingBag,    color: '#b4623f' },
    'Transport':     { icon: Car,            color: '#5b76b0' },
    'Logement':      { icon: Home,           color: '#3f6f63' },
    'Loisirs':       { icon: Sparkles,       color: '#8c6a9e' },
    'Salaire':       { icon: Briefcase,      color: '#3f6f63' },
    'Abonnements':   { icon: Repeat2,        color: '#b08a4f' },
    'Santé':         { icon: Heart,          color: '#b06a7a' },
    'Éducation':     { icon: BookOpen,       color: '#4f8a86' },
    'Transfert':     { icon: ArrowLeftRight, color: '#8a8170' },
};

// Map account names (from Dexie default seed) to design visuals — fallback when no custom glyph/color is stored
const ACCOUNT_VISUALS = {
    'Espèces':      { icon: Wallet,      color: '#9a8f7d' },
    'Carte Djamo':  { icon: CreditCard,  color: '#3f6f63' },
    'Wave':         { icon: Smartphone,  color: '#5b76b0' },
    'Mobile Money': { icon: Smartphone,  color: '#b08a4f' },
};

export function getCategoryVisuals(category) {
    if (!category) return { icon: ShoppingBag, color: '#8a8170' };
    if (category.glyph && GLYPH_ICONS[category.glyph]) {
        return { icon: GLYPH_ICONS[category.glyph], color: category.color || '#8a8170' };
    }
    const match = CATEGORY_VISUALS[category.name];
    if (match) return match;
    return {
        icon: category.type === 'income' ? TrendingUp : TrendingDown,
        color: category.type === 'income' ? '#3f6f63' : '#8a8170',
    };
}

export function getAccountVisuals(account) {
    if (!account) return { icon: Wallet, color: '#8a8170' };
    if (account.glyph && GLYPH_ICONS[account.glyph]) {
        return { icon: GLYPH_ICONS[account.glyph], color: account.color || '#8a8170' };
    }
    return ACCOUNT_VISUALS[account.name] || { icon: Wallet, color: '#8a8170' };
}
