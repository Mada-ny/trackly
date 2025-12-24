import { Button } from "@/components/ui/button"
import TransactionList from "@/components/transactions/TransactionList"
import { Link } from "react-router-dom"
import { FAB } from "@/components/ui/FAB"

export default function DashboardPage() {

    return (
        <div>
            <h1>Hello</h1>
            <TransactionList variant={"mobile"} limit={5} />
            <FAB />
        </div>
    )
}