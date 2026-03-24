import { db } from "./schema";

/**
 * Calcule le solde actuel d'un compte spécifique.
 * @param {number} accountId - L'ID du compte.
 * @returns {Promise<number>} - Le solde actuel.
 */
export async function getAccountBalance(accountId) {
    const account = await db.accounts.get(accountId);
    if (!account) return 0;

    let balance = account.initialBalance || 0;
    
    // On somme tous les montants des transactions liées à ce compte
    const transactions = await db.transactions.where("accountId").equals(accountId).toArray();
    transactions.forEach(t => {
        balance += t.amount;
    });

    return balance;
}
