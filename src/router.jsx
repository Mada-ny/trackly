import { createBrowserRouter } from "react-router";
import MainLayout from "./layouts/MainLayout";
import TransactionsBaseLayout from "./layouts/transactions/TransactionsBaseLayout";
import TransactionsFormLayout from "./layouts/transactions/TransactionsFormLayout";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import NewTransactionPage from "./pages/NewTransactionPage";
import EditTransactionPage from "./pages/EditTransactionPage";
import NewTransferPage from "./pages/NewTransferPage";
import EditTransferPage from "./pages/EditTransferPage";
import SettingsPage from "./pages/SettingsPage";
import DataManagementPage from "./pages/DataManagementPage";
import AccountsManagementPage from "./pages/AccountsManagementPage";
import CategoriesManagementPage from "./pages/CategoriesManagementPage";
import ReportsPage from "./pages/ReportsPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            { index: true, element: <DashboardPage /> },
            {
                path: "reports",
                element: <ReportsPage />
            },
            { 
                path: "transactions", 
                element: <TransactionsBaseLayout />,
                children: [
                    { index: true, element: <TransactionsPage /> },

                    {
                        element: <TransactionsFormLayout />,
                        children: [
                            { path: "new", element: <NewTransactionPage /> },
                            { path: "transfer", element: <NewTransferPage /> },
                            { path: "transfer/:transferId/edit", element: <EditTransferPage /> },
                            { path: ":id/edit", element: <EditTransactionPage /> },
                        ],
                    },
                ],
            },
            { 
                path: "settings", 
                children: [
                    { index: true, element: <SettingsPage /> },
                    { path: "data", element: <DataManagementPage /> },
                    { path: "accounts", element: <AccountsManagementPage /> },
                    { path: "categories", element: <CategoriesManagementPage /> },
                ]
            },
        ]
    }
])