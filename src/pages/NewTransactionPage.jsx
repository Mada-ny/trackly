import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import TransactionForm from "@/components/transactions/TransactionForm"

export default function NewTransactionPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-norway-50">
            <header className="sticky top-0 bg-white border-b border-norway-200 px-4 py-3 flex items-center gap-3 z-10 shadow-sm">
                <Button 
                    onClick={() => navigate(-1)} 
                    variant="ghost" size="sm"
                    className="-ml-4"
                >
                    <ChevronLeft className="size-6" /> <p className="text-base">Retour</p>
                </Button>
            </header>

            <div className="max-w-2xl mx-auto">
                <TransactionForm 
                    onSuccess={() => navigate(-1)}
                />
            </div>
        </div>
    )
}