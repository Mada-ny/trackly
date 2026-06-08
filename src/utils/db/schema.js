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

// Version 2 : Ajout de la table des paramètres
db.version(2).stores({
    settings: "id"
}).upgrade(async tx => {
    // Initialisation des paramètres par défaut lors de la migration
    await tx.settings.add({
        id: "user_preferences",
        currency: "XOF",
        language: "fr"
    });
});

// Version 3 : Support des cycles financiers personnalisés via marqueurs
db.version(3).stores({
    transactions: "++id, date, accountId, categoryId, amount, transferId, isCycleStart, [accountId+date], [date+categoryId]"
});

// Version 4 : Personnalisation (icône/couleur) des comptes & catégories + nom d'utilisateur
// glyph/color ne sont pas indexés : aucun changement de schéma de table requis, seulement la migration des paramètres existants
db.version(4).stores({}).upgrade(async tx => {
    await tx.settings.update("user_preferences", { userName: null });
});

// Version 5 : Type de compte (Liquide / Carte / Mobile / Épargne)
// kind n'est pas indexé : aucun changement de schéma de table requis, seulement le rattrapage des comptes existants
db.version(5).stores({}).upgrade(async tx => {
    await tx.accounts.toCollection().modify(account => {
        if (!account.kind) account.kind = "Carte";
    });
});

// Données initiales lors de la première création de la base
db.on("populate", function(transaction) {
    // Paramètres par défaut
    transaction.settings.add({
        id: "user_preferences",
        currency: "XOF",
        language: "fr",
        userName: null
    });

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
        { name: "Espèces", initialBalance: 0, kind: "Liquide" },
        { name: "Carte Djamo", initialBalance: 0, kind: "Carte" },
        { name: "Wave", initialBalance: 0, kind: "Mobile" },
        { name: "Mobile Money", initialBalance: 0, kind: "Mobile" }
    ])
});

// Ouverture de la base
db.open();