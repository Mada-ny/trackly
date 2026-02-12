import { Badge } from "../ui/badge";
import { getRelativeDate } from "@/utils/date/getRelativeDate";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function TransactionList({
    transactions = [],
    variant = "mobile"
}) {


    if (variant === "mobile") {
        return (
            <>
                <div>
                    <div className="space-y-2">
                        {transactions.map((transaction) => (
                            <div 
                                key={transaction.id}
                                className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800 active:scale-[0.98] transition-transform duration-150 cursor-pointer"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                                            transaction.isIncome 
                                                ? 'bg-emerald-50 dark:bg-emerald-950/30' 
                                                : 'bg-rose-50 dark:bg-rose-950/30'
                                        }`}>
                                            {transaction.isIncome ? (
                                                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                            ) : (
                                                <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1">
                                                {transaction.description}
                                            </h3>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge 
                                                    variant="secondary" 
                                                    className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-medium rounded-md"
                                                >
                                                    {transaction.category?.name}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="text-right">
                                            <div className={`font-bold text-base ${
                                                transaction.isIncome 
                                                    ? "text-emerald-600 dark:text-emerald-400" 
                                                    : "text-red-600 dark:text-red-400"
                                            }`}>
                                                {transaction.isIncome ? '+' : '-'}{Math.abs(transaction.amount).toLocaleString()} F
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                {getRelativeDate(transaction.date)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        )
    } else if (variant === "desktop") {
        return (
            <ul className="px-1">
                {transactions.map((transaction) => 
                    (
                        <li key={transaction.id} className="flex gap-12 items-center py-2">
                            <div className="flex flex-col">
                                <span className="font-semibold">{ transaction.description }</span>
                                <span className="text-sm text-gray-500 font-medium">
                                    {getRelativeDate(transaction.date)}
                                </span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`font-semibold ${transaction.isIncome ? "text-green-400" : "text-red-400" } `}>
                                    {transaction.isIncome ? '+' : '-'}{Math.abs(transaction.amount)}
                                </span>
                                <span className="text-sm font-medium text-gray-500">
                                    {transaction.category?.name}
                                </span>
                            </div>
                        </li>
                    )
                )}
            </ul>
        )
    }
}