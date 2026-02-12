import { Button } from "@/components/ui/button"
import TransactionList from "@/components/transactions/TransactionList"
import { useEnrichedTransactions } from "@/utils/db/hooks/transactions/useEnrichedTransactions"
import { Link } from "react-router-dom"
import { FAB } from "@/components/ui/FAB"
import { ChevronRight } from "lucide-react"
import { compareDesc } from "date-fns"

export default function DashboardPage() {
    const enriched = useEnrichedTransactions();
    const recent = enriched.toSorted((a, b) => compareDesc(a.date, b.date))
        .slice(0, 5);

    return (
        <>
            <div className="my-4 px-4">
                <div className="flex justify-between items-center mb-1 mx-2">
                    <span className="font-medium text-norway-950">Dernières transactions</span>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/transactions" className="text-gray-500">
                                <span className="font-bold">Voir plus</span>
                                <ChevronRight className="mt-0.5" />
                            </Link>
                        </Button>
                </div>
                <TransactionList 
                    variant={"mobile"} 
                    transactions={recent}
                />
            </div>
            <FAB />
        </>
    )
}