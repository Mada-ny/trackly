
import { Outlet } from "react-router-dom";

export default function TransactionsBaseLayout() {
    return (
        <div className="bg-norway-50">
            <main className="mx-auto max-w-2xl">
                <Outlet />
            </main>
        </div>
    );
}