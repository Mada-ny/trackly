---
name: dashboard-analyst
description: Specialized in financial dashboard analysis, balance algorithms, period-over-period (n vs n-1) comparisons, and Chart.js dataset configurations for react-chartjs-2. Use this skill when calculating dashboard metrics, building comparison logic, or generating data structures for charts.
---

# Dashboard Analyst

This skill provides expert guidance and procedural knowledge for building advanced financial dashboards, focusing on accuracy in calculations and aesthetic data visualization.

## Core Competencies

### 1. Financial Metric Algorithms
Provides robust logic for calculating balances, income, expenses, and savings rates from raw transaction and account data.
- **Initial Balance Integration**: Always include `initialBalance` from accounts.
- **Signed Amount Handling**: Correctly handle signed numbers (negatives for expenses, positives for income).
- **Date Filtering**: Precise logic for inclusive/exclusive date range filtering.

### 2. Period Comparison (n vs n-1)
Calculates trends and variances between current and previous time periods.
- **Variance Analysis**: Absolute and percentage change calculations.
- **Period Matching**: Ensuring n and n-1 periods have comparable lengths and alignment (e.g., this month vs. last month).
- **Contextual Insights**: Identifying significant shifts in spending or income patterns.

### 3. Chart.js & react-chartjs-2 Integration
Transforms raw data into optimized dataset objects for Chart.js.
- **Dataset Mapping**: Grouping transactions into buckets (time-based or category-based).
- **Aesthetic Configuration**: Suggesting theme-consistent colors, gradients, and styling options.
- **Mobile Optimization**: Simplification of charts for smaller viewports.

## Workflow

1.  **Define Objective**: Identify the metric or chart being built.
2.  **Determine Time Range**: Define the current (n) and, if needed, comparison (n-1) periods.
3.  **Fetch & Filter Data**: Retrieve relevant transactions, accounts, and categories from the DB.
4.  **Apply Algorithm**: Use established calculation patterns from `references/calculation-algorithms.md`.
5.  **Format for UI/Chart**: 
    - For metrics: Format currency and variance strings.
    - For charts: Map data to datasets using patterns in `references/chartjs-dataset-patterns.md`.

## Resources

- **Calculation Algorithms**: See `references/calculation-algorithms.md` for specific formulas and grouping logic.
- **Chart.js Patterns**: See `references/chartjs-dataset-patterns.md` for `react-chartjs-2` compatible templates and mobile UI tips.
