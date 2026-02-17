import { Dexie } from 'dexie';

// Initialisation de la base de données locale
export const db = new Dexie('BudgetManagerDB');

// Définition du schéma de la base de données (Version 1)
// On utilise IndexedDB via Dexie pour le stockage local-first
db.version(1).stores({
    // ++id : clé primaire auto-incrémentée
    // &name : index unique sur le nom
    accounts: "++id, &name",
    
    // monthlyLimit : permet de suivre le budget par catégorie
    categories: "++id, &name, type, monthlyLimit",
    
    // [accountId+date] etc : index composites pour accélérer les filtres
    // transferId : permet de lier les deux transactions d'un virement
    transactions: "++id, date, accountId, categoryId, amount, transferId, [accountId+date], [date+categoryId], [accountId+categoryId]"
});

// Données initiales lors de la première création de la base
db.on("populate", function(transaction) {
    // Catégories par défaut avec quelques limites suggérées
    transaction.categories.bulkAdd([
        { name: "Alimentation", type: "expense", monthlyLimit: 150000 },
        { name: "Transport", type: "expense", monthlyLimit: 50000 },
        { name: "Logement", type: "expense", monthlyLimit: 300000 },
        { name: "Loisirs", type: "expense", monthlyLimit: 40000 },
        { name: "Salaire", type: "income" },
        { name: "Abonnements", type: "expense", monthlyLimit: 20000 },
        { name: "Santé", type: "expense", monthlyLimit: 30000 },
        { name: "Éducation", type: "expense", monthlyLimit: 100000 },
        { name: "Transfert", type: "expense" } // Catégorie système pour les virements
    ]);

    // Comptes de base pour commencer
    transaction.accounts.bulkAdd([
        { name: "Espèces", initialBalance: 0 },
        { name: "Carte Djamo", initialBalance: 0 },
        { name: "Wave", initialBalance: 0 },
        { name: "Mobile Money", initialBalance: 0 }
    ])
});

// Ouverture de la base
db.open();