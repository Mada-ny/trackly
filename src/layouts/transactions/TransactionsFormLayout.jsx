import { Outlet, useLocation } from "react-router-dom";
import { BackHeader } from "@/components/navigation/BackHeader";

export default function TransactionsFormLayout() {
    const { pathname } = useLocation();

    // Logique de titre dynamique
    let title = "Opération";
    if (pathname.includes("/transfer")) {
        title = pathname.includes("/edit") ? "Modifier le virement" : "Nouveau virement";
    } else {
        title = pathname.includes("/edit") ? "Modifier la transaction" : "Nouvelle transaction";
    }

    return(
        <div className="flex flex-col h-screen bg-background">
            <BackHeader title={title} fallback="/transactions" />
            <div className="grow overflow-y-auto no-scrollbar">
                <Outlet />
            </div>
        </div>
    )
}