import { createBrowserRouter } from "react-router";
import MainLayout from "./layouts/MainLayout";
import TransactionsBaseLayout from "./layouts/transactions/TransactionsBaseLayout";
import TransactionsFormLayout from "./layouts/transactions/TransactionsFormLayout";
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
            { 
                path: "transactions", 
                element: <TransactionsBaseLayout />,
                children: [
                    { index: true, element: <TransactionsPage /> },

                    {
                        element: <TransactionsFormLayout />,
                        children: [
                            { path: "new", element: <NewTransactionPage /> },
                            // { path: ":id/edit", element: <EditTransactionPage /> },
                        ],
                    },
                ],
            },
            { path: "transactions/new", element: <NewTransactionPage /> },
            { path: "settings", element: <SettingsPage /> },
            { path: "settings/data", element: <DataManagementPage /> },
        ]
    }
])