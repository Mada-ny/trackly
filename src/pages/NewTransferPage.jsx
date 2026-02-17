import { useNavigate, useLocation } from "react-router-dom"
import TransferForm from "@/components/transactions/TransferForm"

export default function NewTransferPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from || "/";
    const defaultValues = location.state?.defaultValues || {};

    return (
        <TransferForm
            onSuccess={() => navigate(from)}
            defaultValues={defaultValues}
        />
    )
}
