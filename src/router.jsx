import { createBrowserRouter } from "react-router";
import MainLayout from "./layouts/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import NewTransactionPage from "./pages/NewTransactionPage";
import SettingsPage from "./pages/SettingsPage";
import DataManagementPage from "./pages/DataManagementPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            { index: true, element: <DashboardPage /> },
            { path: "transactions", element: <TransactionsPage /> },
            { path: "transactions/new", element: <NewTransactionPage /> },
            { path: "settings", element: <SettingsPage /> },
            { path: "settings/data", element: <DataManagementPage /> },
        ]
    }
])