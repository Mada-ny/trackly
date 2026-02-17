// dexie-data-architect/scripts/generate-indexeddb-schema.cjs
const readline = require('readline');

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
 * Generates a Dexie.js schema string based on user input.
 */
async function generateIndexedDBSchema() {
    console.log('Welcome to the Dexie.js Schema Generator!');
    console.log('Enter your table definitions. Type "done" when finished.');

    const tables = [];
    let tableName = '';

    while (tableName.toLowerCase() !== 'done') {
        tableName = await askQuestion('Enter table name (or "done" to finish): ');
        if (tableName.toLowerCase() === 'done') break;

        const table = {
            name: tableName,
            indexes: [],
            primaryKey: '++id' // Default primary key
        };

        const pkChoice = await askQuestion(`Enter primary key for ${tableName} (e.g., '++id' or '&name'). Default is '++id': `);
        if (pkChoice) {
            table.primaryKey = pkChoice;
        }

        let indexName = '';
        while (indexName.toLowerCase() !== 'done') {
            indexName = await askQuestion(`Enter index for ${tableName} (e.g., 'name', '[accountId+date]'). Type "done" for indexes: `);
            if (indexName.toLowerCase() === 'done') break;
            table.indexes.push(indexName);
        }
        tables.push(table);
    }

    if (tables.length === 0) {
        console.log('No tables defined. Exiting.');
        rl.close();
        return;
    }

    const schemaParts = tables.map(table => {
        let schema = `${table.primaryKey}`;
        if (table.indexes.length > 0) {
            schema += `,${table.indexes.join(',')}`;
        }
        return `${table.name}: ${schema}`;
    });

    console.log('\nGenerated Dexie.js Schema:');
    console.log(`db.version(1).stores({\n    ${schemaParts.join(',\n    ')}\n});`);

    rl.close();
}

generateIndexedDBSchema();
