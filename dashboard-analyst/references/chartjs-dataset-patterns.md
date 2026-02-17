# Chart.js Dataset Patterns for react-chartjs-2

Guidelines for creating aesthetic and functional Chart.js datasets.

## General Structure

```javascript
{
  labels: ['Jan', 'Feb', 'Mar', ...],
  datasets: [
    {
      label: 'Dataset Label',
      data: [100, 200, 150, ...],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      // ... extra options
    }
  ]
}
```

## Best Practices for Mobile Dashboards

1.  **Simplify Labels**: Use short labels (e.g., "Jan" instead of "January") or rotate them if space is tight.
2.  **Limit Datasets**: Avoid more than 2-3 datasets in a single chart to prevent clutter.
3.  **Use Theme Colors**: Align background and border colors with the app's Tailwind theme (e.g., `deep-emerald-500` for income, `red-500` for expenses).
4.  **Soft Shadows**: Use subtle transparency for background fills.

## Chart Types Examples

### Bar Chart (Monthly Comparison)
*   **Colors**: Positive (Emerald) for income, Negative (Red) for expenses.
*   **Options**: `borderRadius: 4`, `maxBarThickness: 32`.

### Pie/Doughnut Chart (Category Breakdown)
*   **Colors**: Use a diverse palette of colors for categories.
*   **Legend**: Often better to display a custom legend below on mobile instead of the default Chart.js legend.

### Line Chart (Balance Over Time)
*   **Gradient Fill**: Use a gradient under the line for a premium look.
*   **Point Styling**: `pointRadius: 0` for a clean line, `pointHoverRadius: 5` for interactivity.
