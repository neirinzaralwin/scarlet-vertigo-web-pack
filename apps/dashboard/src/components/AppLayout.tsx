'use client'; // Make this a Client Component

import { usePathname } from 'next/navigation';
import Layout from '@/components/Layout'; // Import the main Layout

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/auth/login';

    return (
        <>
            {isLoginPage ? (
                children // Render only children for login page
            ) : (
                <Layout>{children}</Layout> // Wrap other pages with the Layout
            )}
        </>
    );
}
