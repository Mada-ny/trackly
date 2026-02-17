# Zod Validation Patterns for Dexie.js

Zod is a TypeScript-first schema declaration and validation library. It's excellent for ensuring data integrity before it's stored in your Dexie.js database, helping to enforce business rules and prevent common data-related bugs.

## 1. Basic Zod Schema Definition

Define a schema that mirrors your Dexie.js table's structure.

```javascript
import { z } from 'zod';

// For a simple 'Category' table with '++id, name'
export const CategorySchema = z.object({
    id: z.number().optional(), // ID is optional on creation, handled by Dexie
    name: z.string().min(1, { message: "Category name cannot be empty." }),
    // Add other fields as necessary
});

// For an 'Account' table with '++id, name, initialBalance'
export const AccountSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, { message: "Account name cannot be empty." }),
    initialBalance: z.number(),
});
```

## 2. Custom Refinements for Business Rules

Zod's `refine()` method allows you to add custom validation logic that goes beyond basic type checking.

### a. Signed Amounts (e.g., for Transactions)

Ensuring amounts are positive for income and negative for expenses (or vice-versa).

```javascript
import { z } from 'zod';

export const TransactionSchema = z.object({
    id: z.number().optional(),
    date: z.date(), // Will be refined below to ensure it's a Date object
    accountId: z.number().min(1, { message: "Account is required." }),
    categoryId: z.number().min(1, { message: "Category is required." }),
    amount: z.number()
        .refine(val => val !== 0, { message: "Amount cannot be zero." })
        .refine(val => Math.abs(val) > 0, { message: "Amount must be a non-zero value." }),
    description: z.string().optional(),
}).refine(data => {
    // Example: If category is "Income", amount should be positive.
    // This would typically require fetching the category type from DB or having it in data.
    // For simplicity, let's assume 'amount' should just be non-zero as per above.
    return true; // Or implement complex logic based on other fields
}, {
    message: "Transaction amount does not match category type rules.",
    path: ["amount"],
});
```

### b. Cross-Field Validation

Use `refine()` on the `z.object()` to validate relationships between multiple fields.

```javascript
export const ExpenseReportSchema = z.object({
    amount: z.number(),
    reimbursementRequested: z.boolean(),
    reimbursementAmount: z.number().optional(),
}).refine(data => {
    if (data.reimbursementRequested && (data.reimbursementAmount === undefined || data.reimbursementAmount <= 0)) {
        return false; // If reimbursement is requested, amount must be positive
    }
    if (!data.reimbursementRequested && data.reimbursementAmount !== undefined && data.reimbursementAmount > 0) {
        return false; // If no reimbursement requested, no reimbursement amount should be set
    }
    return true;
}, {
    message: "Reimbursement amount is required if requested, and cannot be set if not requested.",
    path: ["reimbursementAmount"], // Points to the specific field in error
});
```

## 3. Date Object Validation (`z.instanceof(Date)`)

Dexie.js can store JavaScript `Date` objects directly. Zod can validate this.

```javascript
import { z } from 'zod';

export const EventSchema = z.object({
    id: z.number().optional(),
    title: z.string(),
    startDate: z.instanceof(Date, { message: "Start date must be a valid Date object." }),
    endDate: z.instanceof(Date, { message: "End date must be a valid Date object." }).optional(),
}).refine(data => {
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
        return false;
    }
    return true;
}, {
    message: "End date cannot be before start date.",
    path: ["endDate"],
});
```
*Tip: If you store dates as ISO strings, use `z.string().datetime()` instead.*

## 4. Integration with Dexie.js

You can validate data before adding or putting it into your Dexie.js database.

```javascript
import { db } from './db'; // Your Dexie.js instance
import { TransactionSchema } from './schemas'; // Your Zod schema

async function addValidatedTransaction(transactionData) {
    try {
        // 1. Validate the incoming data
        const validatedTransaction = TransactionSchema.parse(transactionData);

        // Ensure date is a Date object if schema expects it
        // The generate-zod-schema.cjs script helps create schema that expects this
        if (typeof validatedTransaction.date === 'string') {
            validatedTransaction.date = new Date(validatedTransaction.date);
        }

        // 2. Add to Dexie.js
        const id = await db.transactions.add(validatedTransaction);
        console.log(`Transaction added with id: ${id}`);
        return id;
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("Validation failed:", error.errors);
            throw new Error("Validation failed: " + error.errors.map(err => err.message).join(", "));
        }
        console.error("Failed to add transaction:", error);
        throw error;
    }
}

// Example usage:
// addValidatedTransaction({
//     date: new Date(),
//     accountId: 1,
//     categoryId: 2,
//     amount: -50.25,
//     description: "Coffee"
// });
```

## 5. Error Handling

Zod errors are structured and easy to parse.

```javascript
import { z } from 'zod';

try {
    TransactionSchema.parse({ date: "invalid", amount: 0 });
} catch (error) {
    if (error instanceof z.ZodError) {
        console.error("Validation issues:");
        error.errors.forEach(err => {
            console.log(`- Path: ${err.path.join('.')}, Message: ${err.message}`);
        });
    } else {
        console.error("An unexpected error occurred:", error);
    }
}
```

By applying these Zod validation patterns, you can create a robust data layer that ensures consistency and reliability within your Dexie.js local-first application.
