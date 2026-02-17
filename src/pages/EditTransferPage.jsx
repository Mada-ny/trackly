import { useNavigate, useParams, useLocation } from "react-router-dom"
import TransferForm from "@/components/transactions/TransferForm"

export default function EditTransferPage() {
    const { transferId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from || "/transactions";

    return (
        <TransferForm
            mode="edit"
            transferId={transferId}
            onSuccess={() => navigate(from)}
        />
    )
}
