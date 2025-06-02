// Breadcrumb configuration for your app
// Add custom labels here for any routes that need special formatting

export interface RouteMetadata {
    label?: string;
    hideFromBreadcrumbs?: boolean;
}

export const ROUTE_METADATA: Record<string, RouteMetadata> = {
    // Dashboard routes
    '/dashboard': { label: 'Overview' },

    // Products routes
    '/products': { label: 'All Products' },

    // Settings routes
    '/settings': { label: 'General Settings' },

    // Projects routes
    '/projects': { label: 'Projects' },
    '/projects/design-engineering': { label: 'Design & Engineering' },
    '/projects/sales-marketing': { label: 'Sales & Marketing' },
    '/projects/travel': { label: 'Travel' },

    // Add more routes as needed only when default formatting isn't sufficient...
    // Example:
    // '/users/[id]/profile': { label: 'User Profile' },
    // '/products/[slug]/edit': { label: 'Edit Product' },
};
