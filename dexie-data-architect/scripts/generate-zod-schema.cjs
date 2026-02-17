// dexie-data-architect/scripts/generate-zod-schema.cjs
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
 * Generates a Zod schema for a given table definition.
 */
async function generateZodSchema() {
    console.log('Welcome to the Zod Schema Generator for Dexie.js!');

    const tableName = await askQuestion('Enter the table name (e.g., "transactions"): ');
    if (!tableName) {
        console.log('Table name not specified. Exiting.');
        rl.close();
        return;
    }

    const fields = [];
    let addMoreFields = 'y';
    while (addMoreFields.toLowerCase() === 'y') {
        const fieldName = await askQuestion('Enter field name (e.g., "amount"): ');
        const fieldType = await askQuestion('Enter field type (string, number, date, boolean, any): ');
        const isRequired = await askQuestion('Is this field required? (y/n): ');

        const field = {
            name: fieldName,
            type: fieldType,
            required: isRequired.toLowerCase() === 'y'
        };

        if (fieldType === 'number') {
            const isSignedAmount = await askQuestion('Is this a signed amount (negative for expenses, positive for income)? (y/n): ');
            field.isSignedAmount = isSignedAmount.toLowerCase() === 'y';
        }
        if (fieldType === 'date') {
            const storeAsDate = await askQuestion('Should this date be stored as a JavaScript Date object? (y/n): ');
            field.storeAsDate = storeAsDate.toLowerCase() === 'y';
        }

        fields.push(field);
        addMoreFields = await askQuestion('Add another field? (y/n): ');
    }

    const schemaFields = fields.map(field => {
        let schemaLine = `  ${field.name}: z.`;
        switch (field.type) {
            case 'string':
                schemaLine += 'string()';
                break;
            case 'number':
                schemaLine += 'number()';
                if (field.isSignedAmount) {
                    schemaLine += `.refine(val => val !== 0, "Amount cannot be zero")`;
                }
                break;
            case 'date':
                if (field.storeAsDate) {
                    schemaLine += 'instanceof(Date)';
                } else {
                    schemaLine += 'string().datetime()'; // Assuming string datetime if not Date object
                }
                break;
            case 'boolean':
                schemaLine += 'boolean()';
                break;
            case 'any':
                schemaLine += 'any()';
                break;
            default:
                schemaLine += 'any()';
        }
        if (field.required) {
            schemaLine += `.nonempty()`; // For strings, numbers (cannot be 0 for signed), etc.
        } else {
            schemaLine += `.optional()`;
        }
        return schemaLine;
    }).join(',\n');

    const schemaName = `${tableName.charAt(0).toUpperCase() + tableName.slice(1)}Schema`;

    const template = `import { z } from 'zod';

export const ${schemaName} = z.object({
${schemaFields}
});

// Example of how to use:
// try {
//   ${schemaName}.parse({ /* your data here */ });
//   console.log("Validation successful!");
// } catch (error) {
//   console.error("Validation failed:", error.errors);
// }
`;

    const fileName = `${schemaName}.js`;
    fs.writeFileSync(fileName, template, 'utf8');
    console.log(`\nGenerated Zod schema: ${fileName}`);

    rl.close();
}

generateZodSchema();
