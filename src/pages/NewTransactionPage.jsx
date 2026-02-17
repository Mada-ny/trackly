import { useNavigate, useLocation } from "react-router-dom"
import TransactionForm from "@/components/transactions/TransactionForm"

export default function NewTransactionPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from || "/transactions";
    const defaultValues = location.state?.defaultValues || {};

    return (
        <TransactionForm
            mode="create"
            onSuccess={() => navigate(from)}
            defaultValues={defaultValues}
        />
    )
}