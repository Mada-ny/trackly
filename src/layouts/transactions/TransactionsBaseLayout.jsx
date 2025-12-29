import { Outlet } from "react-router-dom";

export default function TransactionsBaseLayout() {
    return (
        <div className="min-h-screen bg-norway-50">
            <main className="mx-auto max-w-2xl">
                <Outlet />
            </main>
        </div>
    );
}