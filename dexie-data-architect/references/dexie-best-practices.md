# Dexie.js Best Practices

This document outlines best practices for designing and optimizing your Dexie.js database for performance, maintainability, and data integrity.

## 1. Indexing Strategies

Effective indexing is crucial for query performance in IndexedDB.

*   **Primary Keys**: Always define a primary key. Use `++id` for auto-incrementing numeric keys, or `&fieldName` for unique string/numeric keys.
    *   Example: `users: '++id, name, email'` (auto-incrementing ID)
    *   Example: `products: '&sku, name'` (unique SKU)

*   **Single-Column Indexes**: Add indexes for frequently queried columns.
    *   Example: `transactions: '++id, amount, date'` (index on `amount` and `date` for filtering/sorting)

*   **Compound Indexes**: Essential for queries involving multiple criteria, especially for range queries on multiple fields or sorting by multiple fields. The order of fields in a compound index matters significantly.
    *   **Syntax**: `[field1+field2]`
    *   **Example for Transactions**: `[accountId+date]`, `[date+categoryId]`
        *   `transactions: '++id, amount, [accountId+date], [date+categoryId]'`
    *   **Use Cases**:
        *   Retrieving all transactions for a specific `accountId` within a `date` range.
        *   Sorting transactions by `date` then by `categoryId`.
    *   **Rule of Thumb**: Place the field with higher cardinality or the one used for equality checks first in a compound index.

*   **MultiEntry Indexes**: Use `*` prefix for array fields if you query individual elements within the array.
    *   Example: `tags: '++id, *tagNames'`

## 2. Performance Optimization Tips

*   **Batch Operations**: Whenever possible, use `db.table.bulkAdd()`, `db.table.bulkPut()`, `db.table.bulkDelete()` instead of individual `add()`, `put()`, `delete()` operations. Bulk operations are significantly faster as they reduce transaction overhead.
*   **Minimize Data Retrieved**: Only fetch the data you need. Use `offset()`, `limit()`, `first()`, `last()`, and projections (`.toArray(item => item.specificField)`) to reduce memory consumption and improve speed.
*   **Efficient Queries**:
    *   Use indexed properties in your queries (`.where('indexName').equals(...)`, `.between(...)`, `.startsWith(...)`).
    *   Avoid using `.filter()` on large datasets, as it iterates over the entire collection in memory. If you must filter, ensure it's applied after an indexed query to narrow down the results as much as possible.
*   **LiveQuery sparingly**: While `useLiveQuery` (from `dexie-react-hooks`) is powerful, be mindful of its overhead. Complex `liveQuery` functions that process large amounts of data can impact performance. Optimize the underlying Dexie queries first.

## 3. Common Pitfalls

*   **Missing Indexes**: Querying unindexed fields on large tables will be slow. Always ensure your frequently queried fields have appropriate indexes.
*   **Incorrect Compound Index Order**: If your compound index is `[A+B]` but your query often filters by `B` without `A`, the index might not be fully utilized. Re-evaluate index order based on query patterns.
*   **Blocking the UI Thread**: Long-running synchronous operations or large data processing within `liveQuery` callbacks can block the main thread, leading to a unresponsive UI. Use `await` for Dexie operations and consider Web Workers for heavy data crunching.
*   **Not Handling Migration**: Neglecting database migrations (`db.version().upgrade()`) can lead to data loss or errors when your schema changes. Plan and implement migrations carefully.
*   **Inconsistent Data Types**: IndexedDB is typeless, but Dexie.js and your application code benefit from consistent data types. For example, always store dates as `Date` objects or ISO strings, not mixed types.

## 4. Schema Design Considerations

*   **Normalize vs. Denormalize**:
    *   **Normalization**: Good for data integrity and reducing redundancy. Might require more joins (which are in-memory with Dexie.js, so often fast enough).
    *   **Denormalization**: Can reduce the need for joins, improving read performance. Increases data redundancy and complexity of write operations.
    *   **Recommendation**: Start normalized. Only denormalize if profiling reveals a specific performance bottleneck related to joins that cannot be solved with better indexing or querying.
*   **Relationship Management**: For one-to-many or many-to-many relationships, store foreign keys (IDs) in the related tables. Use custom hooks (like generated `useEnrichedTransactions`) to perform efficient in-memory joins.
*   **Small Tables**: For very small, infrequently updated lookup tables (e.g., currency list), consider storing them directly in an array or map in memory after an initial fetch, rather than constantly querying Dexie.js.

By adhering to these best practices, you can build performant and robust local-first applications with Dexie.js.
