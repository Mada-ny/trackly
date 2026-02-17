# Dashboard Calculation Algorithms

This document outlines the core algorithms for calculating financial metrics in the budget manager app.

## Balance Calculation

The total balance is the sum of all initial account balances plus all income transactions minus all expense transactions.

**Formula:**
`Total Balance = Σ(Account Initial Balances) + Σ(Income Transaction Amounts) + Σ(Expense Transaction Amounts)`

*Note: In our database, expense amounts are stored as negative numbers.*

## Period Totals (Income & Expenses)

To calculate totals for a specific period (e.g., last 30 days):

1.  **Filter transactions** by date range.
2.  **Sum income**: Sum of `amount` where `category.type === 'income'`.
3.  **Sum expenses**: Sum of `Math.abs(amount)` where `category.type === 'expense'`.

## n vs n-1 Comparison Logic

Comparing the current period (n) to the previous period (n-1).

1.  **Define Periods**:
    *   Current (n): `[startDate, endDate]`
    *   Previous (n-1): `[startDate - periodLength, startDate - 1ms]`
2.  **Calculate Metrics** for both periods (Income, Expenses, Savings).
3.  **Calculate Variance**:
    *   `Absolute Change = n - (n-1)`
    *   `Percentage Change = ((n - (n-1)) / (n-1)) * 100` (Handle division by zero)

## Grouping Logic for Charts

For time-series charts (e.g., Monthly Bar Chart):

1.  **Define Buckets**: Create a range of date buckets (e.g., first day of each month for the last 6 months).
2.  **Aggregate Data**: Iterate through transactions and add their amounts to the corresponding bucket based on their date.
3.  **Fill Gaps**: Ensure buckets with no transactions are represented with a value of 0.
