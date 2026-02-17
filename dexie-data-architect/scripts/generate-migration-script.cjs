// dexie-data-architect/scripts/generate-migration-script.cjs
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Prompts the user for input.
 * @param {string} query The question to ask the user.
 * @returns {Promise<string>} The user's answer.
 */
function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

/**
 * Generates a Dexie.js migration script boilerplate.
 */
async function generateMigrationScript() {
    console.log('Welcome to the Dexie.js Migration Script Generator!');

    const dbName = await askQuestion('Enter your database name (e.g., "myDatabase"): ');
    const oldVersion = await askQuestion('Enter the OLD schema version (e.g., 1): ');
    const newVersion = await askQuestion('Enter the NEW schema version (e.g., 2): ');
    
    if (!dbName || !oldVersion || !newVersion) {
        console.log('Database name, old version, or new version not specified. Exiting.');
        rl.close();
        return;
    }

    const storesDefinition = await askQuestion(`Enter the new stores definition for version ${newVersion} (e.g., '{ accounts: "++id, name", categories: "++id, name", transactions: "++id, accountId, categoryId, amount, date" }'):\n`);

    const upgradeLogicPrompt = await askQuestion(`
Now, let's define the upgrade logic for version ${newVersion}.
This is where you handle data migration (e.g., moving data, transforming data, adding new fields).
Provide JavaScript code for the 'upgrade' block. You'll have access to 'tx' (transaction).
Type 'DONE' on a new line to finish your input.
`);

    let upgradeLogic = '';
    let line;
    while ((line = await askQuestion('')) !== 'DONE') {
        upgradeLogic += line + '\n';
    }

    const template = `// dexie-data-architect/scripts/generated-migration-v${oldVersion}-to-v${newVersion}.js
import Dexie from 'dexie';

const db = new Dexie('${dbName}');

// Define the schema for the NEW version
db.version(${newVersion}).stores(${storesDefinition || '{}'}).upgrade(async (tx) => {
    console.log('Migrating database from version ${oldVersion} to ${newVersion}...');

    // --- Schema Changes & Data Migrations ---
    // Example: Add a new field with a default value
    // await tx.table('yourTable').toCollection().modify(item => {
    //     item.newField = 'defaultValue';
    // });

    // Example: Rename an index (Dexie handles this by redefining stores, but for data transform)
    // if (db.table('oldTableName') && !db.table('newTableName')) {
    //     await tx.table('oldTableName').toCollection().each(async (item) => {
    //         // Transform and add to new table
    //         await tx.table('newTableName').add(item);
    //     });
    //     // Deleting old table can be done by simply not defining it in the new stores()
    // }

    // Your custom upgrade logic goes here:
${upgradeLogic.trim()}

    console.log('Database migration to version ${newVersion} completed.');
});

// To run this migration:
// 1. Ensure your main Dexie instance uses this new version definition.
// 2. Open your application; Dexie will automatically handle the migration.
// Example:
// import { db } from './path/to/your/db-instance';
// db.open(); // This will trigger the migration if the version is lower.
`;

    const fileName = `generated-migration-v${oldVersion}-to-v${newVersion}.js`;
    fs.writeFileSync(fileName, template, 'utf8');
    console.log(`\nGenerated migration script: ${fileName}`);
    console.log('Remember to integrate this into your main Dexie instance.');

    rl.close();
}

generateMigrationScript();
