# shadcn Mobile Development Guidance

This document provides guidance and best practices for leveraging `shadcn` components in mobile-first React applications, styled with Tailwind CSS v4.

## Key Principles for Mobile UI with shadcn and Tailwind CSS

1.  **Mobile-First Approach**: Always design and develop for mobile screens first, then progressively enhance for larger viewports using Tailwind's responsive prefixes (e.g., `sm:`, `md:`, `lg:`).
2.  **Touch-Friendly Interactions**: Ensure all interactive elements (buttons, inputs, navigation items) have sufficient tap targets (minimum 44x44px) and clear visual feedback for touch events.
3.  **Performance Optimization**: Keep component trees shallow, minimize re-renders, and consider lazy loading for complex components or large images to ensure smooth performance on mobile devices.
4.  **Accessibility**: Prioritize WCAG guidelines. Ensure proper `aria` attributes, keyboard navigation (even for touch-only devices, it's good practice), and sufficient contrast ratios.

## Common shadcn Component Customizations for Mobile

### Buttons

-   **Full-width buttons**: Often preferred for primary actions on mobile.
    ```jsx
    <Button className="w-full">Primary Action</Button>
    ```
-   **Icon-only buttons**: For secondary actions or navigation, ensure proper sizing and accessibility labels.
    ```jsx
    <Button variant="ghost" size="icon" aria-label="Settings">
      <Settings className="h-4 w-4" />
    </Button>
    ```

### Cards

-   **Simple and Stacked Layouts**: On mobile, cards often work best with content stacked vertically.
-   **Limited Information Density**: Avoid overwhelming users with too much information on a single card.
-   **Clickable Areas**: Ensure the entire card or significant portions are easily tappable if they lead to a new view.

### Navigation (Bottom Navigation, Drawers)

-   **Bottom Navigation**: Ideal for primary navigation with 3-5 top-level destinations.
    *   Consider `shadcn`'s `Tabs` or a custom component for this pattern.
-   **Drawer/Sidebar Navigation**: Excellent for secondary navigation, settings, or less frequently accessed links.
    *   Utilize `shadcn`'s `Sheet` component for this.

## Responsive Design Patterns with Tailwind CSS

-   **Fluid Typography**: Use `clamp()` or fluid font sizing techniques, alongside Tailwind's `text-sm`, `text-base`, etc., to adapt font sizes.
-   **Spacing**: Rely on Tailwind's consistent spacing scale (e.g., `p-4`, `m-2`) and adjust with responsive prefixes.
-   **Flexbox and Grid**: Use `flex` and `grid` utilities for flexible and responsive layouts.
    ```jsx
    {/* Example: Two columns on desktop, stacked on mobile */}
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">Content 1</div>
      <div className="flex-1">Content 2</div>
    </div>
    ```

## Integrating shadcn with Project Structure

-   **`components/ui/`**: Follow the `shadcn` recommended structure for storing your customized components.
-   **Theming**: Extend Tailwind's `tailwind.config.js` to match your brand's colors, fonts, and spacing, ensuring `shadcn` components automatically inherit these styles.
