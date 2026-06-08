# Trackly - Development Guide

## Vision

Trackly is a mobile-first PWA designed to provide a fluid, secure, and fully offline budget management experience. The app focuses on rapid entry and clear strategic reporting.

## Current State (v1.3)

### 1. Identity & UX

- **Branding**: Trackly identity with "Mint & Forest" OKLCH palette.
- **Floating Navigation**: "Hide on Scroll" behavior for the mobile navigation bar and the FAB.
- **Dynamic FAB**: The "+" button is a compact menu offering "Transaction" and "Transfer", with a rotation animation and emerald color coding.
- **Display & Scrolling**: Uses `dvh` (Dynamic Viewport Height) to eliminate layout jumps on mobile. Fixed overflow on `time` fields for iOS Safari.
- **Amount Display**: Smart `AmountDisplay` component with marquee effect and compact/full view toggle.
- **Instant Page Switches**: No page-level transition/animation between routes — `<Outlet />` renders directly in `MainLayout`, matching the reference design's instant screen switches (View Transitions/`PageTransition` removed as they felt off).
- **Settings revamp complete**: `SettingsPage`, `AccountsManagementPage`, `CategoriesManagementPage` and `DataManagementPage` rewritten on the inline-style design system (`var(--serif)`, `var(--ink)`, `var(--surface)`, `hexA()`), replacing shadcn `Card`/`Breadcrumb`/`AlertDialog`/`BackHeader`. Data page tracks `lastBackupAt` via `useSettings` and date-fns `fr` locale.
- **"Virement" terminology**: Standardized user-facing copy on "Virement" for transfer operations (toasts, filters, transaction detail). The internal DB category name stays `"Transfert"` (changing it would require a data migration). "Virements" is now a filterable type in `FilterDrawer` and a 4th segment on the Transactions screen, using the canonical accent color `#5b76b0` (`QuickAddSheet`'s `TYPE_ACCENT.transfer`).

### 2. Reports & Intelligence

- **Monthly Reports**: Calendar analysis with precise savings rate calculation. Month switcher cannot navigate to future months (next-month chevron disabled via `isSameMonth` check).
- **Improved Logic**: Transfers treated as a single operation. Automatic fallback on transaction sign when no category.
- **Hybrid Charts**: Real-time balance trends (Dashboard `Sparkline`) coupled with flow visualization (Reports `Ring` savings gauge + `MiniBars` 7-day income/expense bars).
- **UX Consistency**: "Dead zone" (padding-bottom) on transaction list so floating nav and FAB don't obscure last items.

### 3. Reliability & Performance

- **Balance Validation**: Systematic blocking of transactions and transfers if account balance is insufficient, with explicit error notification.
- **Robust Forms**: Validation errors shown on all fields (including Date and Time). Future validation relaxed with 1-minute tolerance. Description minimum reduced to 2 characters for faster entry.
- **Anti-Flicker**: 200ms delay on loading states to avoid flickering on fast local access.
- **Error Handling**: Robust `try/catch` in data hooks to prevent infinite loading screens.
- **Chart.js fully replaced** by lightweight custom SVG/CSS visualizations in Dashboard (`Sparkline` polyline) and Reports (`Ring` progress circle, `MiniBars` paired bars) — `chart.js`/`react-chartjs-2` packages and the global registration in `main.jsx` have been removed entirely.
- **`useMemo` on derived series data** in Dashboard and Reports — daily/weekly series recomputed only on Dexie updates, not on every render.
- **`useDeferredValue`** for transaction search — React-native deferred filtering instead of fixed 300ms debounce.
- **Single-pass `useDashboardData`** — all metrics (global, per-account, daily chart, budgets) computed in one `forEach` over transactions, eliminating O(n × accounts) loops.
- **Passive scroll listener** on Dashboard carousel — uses `addEventListener('scroll', handler, { passive: true })` instead of React's `onScroll` prop.

## General Guidelines

- Always plan your work before implementing. Only after receiving approval, proceed with implementation.
- Commit messages should be in French and not co-authored.
- Use Windows-compatible commands and PowerShell syntax (e.g., `;` instead of `&&`).
- When making a notable change, keep this file up to date.
- Use the sub-agents in `.claude/agents/` for specialized tasks (dashboard metrics, Dexie schema, mobile UI, desktop UI).

## Tech Stack

- **Frontend**: React 19, React Router v7, Tailwind CSS v4
- **Database**: Dexie.js (IndexedDB), dexie-react-hooks
- **Forms**: react-hook-form + Zod v4
- **Charts**: Custom lightweight SVG/CSS visualizations (no charting library — `chart.js`/`react-chartjs-2` removed)
- **UI Components**: Base UI, Radix UI, shadcn/ui pattern, Vaul (drawers), Sonner (toasts)
- **Build**: Vite 7, vite-plugin-pwa

## Next Steps

- [ ] **Cloud Backup**: Optional encrypted end-to-end synchronization.
- [ ] **Multi-currency**: Automatic amount conversion with exchange rates.
- [ ] **PWA Reminders**: Push notifications to encourage daily logging.
- [ ] **Global Search**: Quick access to transactions from anywhere via `Ctrl+K`.

---
*Last update: June 7, 2026.*
