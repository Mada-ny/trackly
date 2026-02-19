import { LayoutDashboard, WalletCards, Settings, BarChart3 } from "lucide-react";

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
    to: "/reports",
    icon: BarChart3,
    text: "Rapports",
  },
  {
    to: "/settings",
    icon: Settings,
    text: "Paramètres",
  },
];