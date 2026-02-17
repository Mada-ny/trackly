import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/utils/db/schema";

export function useEnrichedTransactions() {
  const transactions = useLiveQuery(async () => {
    const transactions = await db.transactions.toArray();
    const categories = await db.categories.toArray();
    const accounts = await db.accounts.toArray();

    const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));
    const accountMap = new Map(accounts.map((acc) => [acc.id, acc]));

    return transactions
      .map((t) => {
        const category = categoryMap.get(t.categoryId);
        const isTransfer = category?.name === "Transfert";
        return {
          ...t,
          date: new Date(t.date),
          category,
          account: accountMap.get(t.accountId),
          isIncome: isTransfer ? t.amount > 0 : category?.type === "income",
          isTransfer,
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, []);

  return transactions || [];
}