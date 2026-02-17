# Gemini Code Assistant Context

This document provides context for the Gemini code assistant to understand the project's structure, technologies, and conventions.

## Project Overview

This is a client-side **Budget Management Application** built with React and Vite. It allows users to track their income and expenses, manage accounts, and categorize transactions. The application uses `Dexie.js` to store all data locally in the browser's IndexedDB, meaning there is no backend server component.

The user interface is built using **shadcn/ui** components, styled with **Tailwind CSS**. State management and data fetching from the local database are handled through custom hooks that leverage `dexie-react-hooks`.

## Key Technologies

- **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) on top of [Radix UI](https://www.radix-ui.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Client-Side Database**: [Dexie.js](https://dexie.org/) (IndexedDB wrapper)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
- **Data Visualization**: [Chart.js](https://www.chartjs.org/)
- **Linting**: [ESLint](https://eslint.org/)

## Project Structure

```
src/
├── components/   # Reusable UI components, largely from shadcn/ui
│   ├── ui/       # Core shadcn/ui components
│   └── ...
├── layouts/      # Components that define the page structure (e.g., MainLayout)
├── pages/        # Top-level components for each route (e.g., DashboardPage)
├── utils/        # Utility functions and hooks
│   └── db/       # Dexie.js database schema and custom data hooks
├── router.jsx    # Application route definitions using React Router
├── main.jsx      # Application entry point
└── index.css     # Global styles and Tailwind CSS imports
```

## Database Schema (Version 3)

The data is stored in IndexedDB using Dexie.js with the following schema:

- **`accounts`**:
    - `id`: Auto-incrementing primary key
    - `name`: Unique name of the account (e.g., "Cash", "Bank Card")
    - `initialBalance`: The starting balance of the account
- **`categories`**:
    - `id`: Auto-incrementing primary key
    - `name`: Unique name of the category (e.g., "Food", "Salary")
    - `type`: The type of category (`'income'` or `'expense'`)
    - `monthlyLimit`: (Optional) Budget limit for the category
- **`transactions`**:
    - `id`: Auto-incrementing primary key
    - `date`: Date of the transaction
    - `accountId`: Foreign key to the `accounts` table
    - `categoryId`: Foreign key to the `categories` table
    - `amount`: The transaction amount (signed: negative for expenses, positive for income)
    - `description`: A description of the transaction
    - `transferId`: (Optional) UUID used to link two transactions belonging to the same transfer between accounts.

## Building and Running

### Development

To run the application in development mode with hot-reloading:

```bash
npm run dev
```

### Building for Production

To create a production-ready build in the `dist/` directory:

```bash
npm run build
```

### Previewing the Production Build

To serve the production build locally for testing:

```bash
npm run preview
```

## Development Conventions

- **Component-Based Architecture**: The application follows a standard React component-based structure. Pages are composed of smaller, reusable components.
- **Styling**: Use Tailwind CSS utility classes for styling. New custom components should follow the patterns established in the `src/components` directory.
- **Data Access**: All interaction with the local database should be done through the custom hooks found in `src/utils/db/hooks/`. This ensures consistent data handling and state management.
- **Path Aliases**: The project is configured with a path alias `@` that points to the `src/` directory. Use this for cleaner import statements (e.g., `import MyComponent from '@/components/MyComponent'`).
- **Linting**: Code is linted using ESLint. Run `npm run lint` to check for issues before committing.
- **Local-First**: The app must function entirely without a network connection. All state should persist in IndexedDB.
