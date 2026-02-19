import { db } from "./schema";

/**
 * Exporte toutes les données de la base de données (comptes, catégories, transactions) 
 * vers un objet JSON.
 */
export async function exportDatabase() {
    const accounts = await db.accounts.toArray();
    const categories = await db.categories.toArray();
    const transactions = await db.transactions.toArray();

    const data = {
        version: 1, // Version du format d'export
        timestamp: new Date().toISOString(),
        accounts,
        categories,
        transactions,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `budget-manager-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Importe des données depuis un fichier JSON vers la base de données.
 * @param {Object} data - Les données à importer.
 * @param {boolean} clearFirst - Si vrai, vide la base avant l'import.
 */
export async function importDatabase(data, clearFirst = false) {
    if (!data.accounts || !data.categories || !data.transactions) {
        throw new Error("Format de fichier invalide.");
    }

    // Correction: Re-convertir les chaînes de date en objets Date
    const transactionsWithDates = data.transactions.map(t => ({
        ...t,
        date: new Date(t.date)
    }));

    await db.transaction("rw", [db.accounts, db.categories, db.transactions], async () => {
        if (clearFirst) {
            await db.transactions.clear();
            await db.categories.clear();
            await db.accounts.clear();
        }

        await db.accounts.bulkPut(data.accounts);
        await db.categories.bulkPut(data.categories);
        await db.transactions.bulkPut(transactionsWithDates);
    });
}
