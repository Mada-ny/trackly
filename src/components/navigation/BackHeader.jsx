import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

export function BackHeader({
    fallback = "/transactions"
}) {
    const navigate = useNavigate()
    const location = useLocation()

    const handleBack = () => navigate(location.state?.from || fallback)

    return (
        <header className="sticky top-0 bg-white border-b border-norway-200 px-4 py-3 flex items-center gap-3 z-10 shadow-sm">
            <Button 
                onClick={handleBack} 
                variant="ghost" size="sm"
                className="-ml-4"
            >
                <ChevronLeft className="size-6" /> <p className="text-base">Retour</p>
            </Button>
        </header>
    )
}