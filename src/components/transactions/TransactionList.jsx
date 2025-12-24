import { useEnrichedTransactions } from "@/utils/db/hooks/useEnrichedTransactions";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getRelativeDate } from "@/utils/date/getRelativeDate";
import { Badge } from "../ui/badge";

export default function TransactionList({
    detailed = false,
    limit,
    variant = "mobile"
}) {
    const displayedTransactions = useEnrichedTransactions({ limit });

    if (variant === "mobile") {
        return (
            <ul className="p-4 space-y-3">
                {displayedTransactions.map((transaction) => (
                        <li key={transaction.id} className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="font-semibold">{ transaction.description }</span>
                                <span className="text-sm text-gray-500 font-medium">
                                    { detailed 
                                        ? format(transaction.date, "dd MMMM yyyy", { locale: fr }) 
                                        : getRelativeDate(transaction.date) 
                                    }
                                </span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`font-semibold ${transaction.isIncome ? "text-green-400" : "text-red-400" } `}>
                                    {transaction.isIncome ? '+' : ''}{transaction.amount}
                                </span>
                                <span className="text-sm font-medium text-gray-500">{transaction.category?.name}</span>
                            </div>
                        </li>
                    ))}
            </ul>
        )
    } else if (variant === "desktop") {
        return (
            <ul className="px-1">
                {displayedTransactions.map((transaction) => 
                    !detailed ? (
                        <li key={transaction.id} className="flex gap-12 items-center py-2">
                            <div className="flex flex-col">
                                <span className="font-semibold">{ transaction.description }</span>
                                <span className="text-sm text-gray-500 font-medium">
                                    { detailed 
                                        ? format(transaction.date, "dd MMMM yyyy", { locale: fr }) 
                                        : getRelativeDate(transaction.date) 
                                    }
                                </span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`font-semibold ${transaction.isIncome ? "text-green-400" : "text-red-400" } `}>
                                    {transaction.isIncome ? '+' : '-'}{transaction.amount}
                                </span>
                                <span className="text-sm font-medium text-gray-500">
                                    {transaction.category?.name}
                                </span>
                            </div>
                        </li>
                    ) : (
                        <h1 key={transaction.id}>Ha</h1>
                    ))}
            </ul>
        )
    }
}