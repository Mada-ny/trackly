// dexie-data-architect/scripts/generate-enrichment-hook.cjs
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
 * Generates a React hook for data enrichment using useLiveQuery.
 */
async function generateEnrichmentHook() {
    console.log('Welcome to the Dexie.js Enrichment Hook Generator!');

    const mainTableName = await askQuestion('Enter the main table name to enrich (e.g., "transactions"): ');
    const mainTableIdField = await askQuestion(`Enter the primary key field for ${mainTableName} (e.g., "id"): `);

    const relatedTables = [];
    let addMoreRelated = 'y';

    while (addMoreRelated.toLowerCase() === 'y') {
        const relatedTableName = await askQuestion('Enter a related table name (e.g., "categories"): ');
        const relatedTableIdField = await askQuestion(`Enter the primary key field for ${relatedTableName} (e.g., "id"): `);
        const foreignKeyInMainTable = await askQuestion(`Enter the foreign key in ${mainTableName} that links to ${relatedTableName} (e.g., "categoryId"): `);
        const newFieldName = await askQuestion(`Enter the new field name for the enriched object in ${mainTableName} (e.g., "category"): `);
        
        relatedTables.push({
            name: relatedTableName,
            idField: relatedTableIdField,
            foreignKey: foreignKeyInMainTable,
            newField: newFieldName
        });

        addMoreRelated = await askQuestion('Add another related table? (y/n): ');
    }

    if (!mainTableName || relatedTables.length === 0) {
        console.log('Main table or related tables not specified. Exiting.');
        rl.close();
        return;
    }

    const hookName = `useEnriched${mainTableName.charAt(0).toUpperCase() + mainTableName.slice(1)}`;
    const dbImport = `import { db } from '@/utils/db/schema'; // Adjust this path to your Dexie db instance`;
    const useLiveQueryImport = `import { useLiveQuery } from 'dexie-react-hooks';`;
    const reactImport = `import React from 'react';`;

    const relatedTableImports = relatedTables.map(rt => `const ${rt.name}Table = db.${rt.name};`).join('\n');

    const enrichmentLogic = relatedTables.map(rt => `
                const ${rt.newField} = ${rt.name}Table.get(item.${rt.foreignKey});
                if (!${rt.newField}) return null; // Handle missing related data
                enrichedItem.${rt.newField} = ${rt.newField};
`).join('');

    const template = `${reactImport}
${useLiveQueryImport}
${dbImport}

/**
 * Custom hook to fetch and enrich ${mainTableName} data.
 * @returns {Array<Object> | undefined} Enriched ${mainTableName} data.
 */
export function ${hookName}() {
    const rawData = useLiveQuery(async () => db.${mainTableName}.toArray());

    return React.useMemo(() => {
        if (!rawData) return undefined;

        const enrichedDataPromises = rawData.map(async (item) => {
            const enrichedItem = { ...item };
            ${enrichmentLogic}
            return enrichedItem;
        });

        // Resolve all promises concurrently
        return Promise.all(enrichedDataPromises).then(results => results.filter(Boolean));
    }, [rawData]);
}
`;
    const fileName = `${hookName}.js`;
    fs.writeFileSync(fileName, template, 'utf8');
    console.log(`\nGenerated hook: ${fileName}`);
    console.log('Remember to adjust the \'db\' import path to your project\'s structure.');

    rl.close();
}

generateEnrichmentHook();
