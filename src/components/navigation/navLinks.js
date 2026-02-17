import { LayoutDashboard, WalletCards, Settings } from "lucide-react";

export const navLinks = [
  {
    to: "/transactions",
    icon: WalletCards,
    text: "Transactions",
  },
  {
    to: "/",
    icon: LayoutDashboard,
    text: "Tableau de bord",
  },
  {
    to: "/settings",
    icon: Settings,
    text: "Paramètres",
  },
];