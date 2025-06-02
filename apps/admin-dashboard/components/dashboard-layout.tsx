'use client';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { ROUTE_METADATA } from '@/lib/breadcrumb-config';

interface DashboardLayoutProps {
    children: React.ReactNode;
    // Optional: custom breadcrumb override
    breadcrumbOverride?: BreadcrumbItem[];
}

interface BreadcrumbItem {
    label: string;
    href?: string;
}

// Function to generate breadcrumbs based on current path
function generateBreadcrumbs(pathname: string, breadcrumbOverride?: BreadcrumbItem[]): BreadcrumbItem[] {
    // If there's a complete override, use it
    if (breadcrumbOverride) {
        return breadcrumbOverride;
    }

    const segments = pathname.split('/').filter(Boolean);

    // Handle root path
    if (segments.length === 0) {
        return [{ label: 'Dashboard' }];
    }

    const breadcrumbs: BreadcrumbItem[] = [];
    let currentPath = '';

    segments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === segments.length - 1;

        // Check for custom metadata
        const metadata = ROUTE_METADATA[currentPath];
        const label = metadata?.label || formatSegmentLabel(segment);

        breadcrumbs.push({
            label,
            href: isLast ? undefined : currentPath,
        });
    });

    return breadcrumbs;
}

// Helper function to format segment labels
function formatSegmentLabel(segment: string): string {
    // Smart default formatting: capitalize first letter and replace hyphens/underscores with spaces
    return segment
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

export function DashboardLayout({ children, breadcrumbOverride }: DashboardLayoutProps) {
    const pathname = usePathname();
    const breadcrumbs = generateBreadcrumbs(pathname, breadcrumbOverride);

    return (
        <>
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                {breadcrumbs.map((crumb, index) => (
                                    <div key={index} className="flex items-center">
                                        <BreadcrumbItem className={index === 0 ? 'hidden md:block' : ''}>
                                            {crumb.href ? <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink> : <BreadcrumbPage>{crumb.label}</BreadcrumbPage>}
                                        </BreadcrumbItem>
                                        {index < breadcrumbs.length - 1 && <BreadcrumbSeparator className="hidden md:block" />}
                                    </div>
                                ))}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
            </SidebarInset>
        </>
    );
}
