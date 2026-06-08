
import { Outlet } from "react-router-dom";

export default function TransactionsBaseLayout() {
    return (
        <div className="bg-background">
            <main className="mx-auto max-w-2xl md:max-w-7xl transition-all duration-300">
                <Outlet />
            </main>
        </div>
    );
}