import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

export function BackHeader({
    fallback = "/transactions",
    title = "",
    action = null
}) {
    const navigate = useNavigate()
    const location = useLocation()

    const handleBack = () => navigate(location.state?.from || fallback)

    return (
        <header className="shrink-0 bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-30">
            <div className="px-4 pt-6 pb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                    <Button 
                        onClick={handleBack} 
                        variant="ghost" 
                        size="icon-sm"
                        className="rounded-full h-9 w-9 -ml-2"
                    >
                        <ChevronLeft className="w-6 h-6 text-foreground" />
                    </Button>
                    
                    {title && (
                        <h1 className="text-2xl font-black tracking-tight text-foreground truncate">
                            {title}
                        </h1>
                    )}
                </div>

                {action && (
                    <div className="shrink-0">
                        {action}
                    </div>
                )}
            </div>
        </header>
    )
}
