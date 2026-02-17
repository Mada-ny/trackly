---
name: dexie-data-architect
description: Provides comprehensive tools and guidance for designing, optimizing, and managing Dexie.js schemas for local-first applications. Use this skill when you need to define, evolve, and validate Dexie.js database structures, generate React hooks for data enrichment, enforcing business rules (like signed amounts and Zod validation), or implementing robust database migration strategies and persistence for client-side data.
---

# Dexie Data Architect

## Overview

The Dexie Data Architect skill empowers you to efficiently design, build, and maintain robust local-first data layers using Dexie.js and React. It provides specialized tools and knowledge to optimize performance, ensure data integrity, and manage the lifecycle of your client-side database.

## Core Capabilities

This skill offers a suite of functionalities to streamline your Dexie.js development workflow:

### 1. Schema Optimization and Indexing

*   **Purpose**: Helps you define and evolve your Dexie.js database schema with an emphasis on performance, particularly for mobile environments with large datasets. It guides you in creating efficient compound indexes.
*   **Tools**:
    *   `scripts/generate-indexeddb-schema.cjs`: Automates the generation of Dexie.js schema definitions, including intelligent suggestions for compound indexes (e.g., `[accountId+date]`, `[date+categoryId]`).
    *   `references/dexie-best-practices.md`: Provides in-depth guidance on indexing strategies, performance tuning, and common pitfalls to avoid.

### 2. Enrichment Hook Generation

*   **Purpose**: Automates the creation of React hooks (utilizing `dexie-react-hooks`'s `liveQuery`) that perform in-memory joins to enrich raw transaction data by linking foreign keys to their respective full objects (e.g., categories, accounts).
*   **Tools**:
    *   `scripts/generate-enrichment-hook.cjs`: Generates ready-to-use React hooks that mimic patterns like `useEnrichedTransactions`, simplifying data presentation.

### 3. Business Rule Enforcement (Data Guardian)

*   **Purpose**: Ensures data integrity by applying consistent validation and transformation rules during data insertion and modification operations. This includes handling signed amounts, consistent date storage, and robust validation.
*   **Tools**:
    *   `scripts/generate-zod-schema.cjs`: Creates Zod schemas based on your Dexie.js table definitions, incorporating validation rules for signed amounts (negative for expenses, positive for income) and JavaScript `Date` objects.
    *   `references/zod-validation-patterns.md`: Offers advanced Zod patterns and examples for complex validation scenarios.

### 4. Local-First Lifecycle Management

*   **Purpose**: Facilitates the smooth evolution of your database schema over time, preventing data loss during application updates, and ensuring data persistence across browser sessions.
*   **Tools**:
    *   `scripts/generate-migration-script.cjs`: Provides boilerplate and guidance for creating robust `db.version.upgrade` migration scripts.
    *   `references/storage-manager-api.md`: Documents how to leverage the Web StorageManager API for guaranteed data persistence and quota management.
    *   `references/data-modeling-patterns.md`: Explores various data modeling strategies for local-first applications, including versioning considerations.

## Resources

This skill includes example resource directories that demonstrate how to organize different types of bundled resources:

### scripts/
Executable code that can be run directly to perform specific operations.

**Examples:**
- `generate-indexeddb-schema.cjs`: Generate Dexie.js schema with optimized indexes.
- `generate-enrichment-hook.cjs`: Create React `liveQuery` hooks for data enrichment.
- `generate-zod-schema.cjs`: Produce Zod validation schemas.
- `generate-migration-script.cjs`: Scaffold database migration logic.

### references/
Documentation and reference material intended to be loaded into context to inform Gemini CLI's process and thinking.

**Examples:**
- `dexie-best-practices.md`: Best practices for Dexie.js performance and usage.
- `data-modeling-patterns.md`: Patterns for structuring local-first data.
- `storage-manager-api.md`: Guide to using the Web StorageManager API.
- `zod-validation-patterns.md`: Advanced Zod validation techniques.

### assets/
Files not intended to be loaded into context, but rather used within the output Gemini CLI produces. This skill does not currently have specific assets, but this directory is available for future expansion (e.g., boilerplate templates).
