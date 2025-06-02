# Dynamic Breadcrumb System

This improved breadcrumb system automatically generates breadcrumbs based on your Next.js app directory structure, eliminating the need to manually add every route to a mapping object.

## How it works

1. **Automatic Generation**: Breadcrumbs are automatically generated from the URL path segments
2. **Smart Formatting**: Segments are automatically formatted (capitalized, hyphens/underscores converted to spaces)
3. **Custom Labels**: Override labels for specific routes using the configuration file
4. **No Maintenance**: No need to update breadcrumbs when adding new routes

## Usage

### Basic Usage (No changes needed)

The breadcrumbs will automatically work for any route in your app:

- `/dashboard` → "Dashboard"
- `/settings/general` → "Settings > General"
- `/projects/design-engineering` → "Projects > Design Engineering"

### Custom Labels

To customize labels for specific routes, edit `/lib/breadcrumb-config.ts`:

```typescript
export const ROUTE_METADATA: Record<string, RouteMetadata> = {
    '/dashboard': { label: 'Overview' },
    '/settings/general': { label: 'General Settings' },
    '/projects/design-engineering': { label: 'Design & Engineering' },
    // Add your custom routes here
};
```

### Custom Segment Labels

For common segments that appear in multiple routes, use `SEGMENT_LABELS`:

```typescript
export const SEGMENT_LABELS: Record<string, string> = {
    dashboard: 'Dashboard',
    settings: 'Settings',
    users: 'Users',
    products: 'Products',
    // Add more as needed
};
```

### Override for Specific Pages

For special cases, you can override breadcrumbs in individual pages:

```typescript
import { DashboardLayout } from '@/components/dashboard-layout';

export default function SpecialPage() {
    const customBreadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'Special Section', href: '/special' },
        { label: 'Current Page' }
    ];

    return (
        <DashboardLayout breadcrumbOverride={customBreadcrumbs}>
            {/* Your page content */}
        </DashboardLayout>
    );
}
```

## Benefits

✅ **No Maintenance**: Add new routes without updating breadcrumb mappings  
✅ **Consistent**: Automatic formatting ensures consistency  
✅ **Flexible**: Easy to customize when needed  
✅ **Scalable**: Works with any number of routes  
✅ **Type Safe**: Full TypeScript support

## Migration from old system

1. Remove the old `breadcrumbMap` object
2. Add any custom labels you need to `/lib/breadcrumb-config.ts`
3. That's it! Your breadcrumbs will continue working automatically

## Dynamic Routes

For dynamic routes (e.g., `/users/[id]`), the system will:

1. Show the actual segment value (e.g., "123" for `/users/123`)
2. You can customize these in `ROUTE_METADATA` if needed
3. For user-friendly labels, consider fetching data and using `breadcrumbOverride`
