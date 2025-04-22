import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Layout from '@/components/Layout'; // Import the new Layout component
import { headers } from 'next/headers'; // Import headers to check pathname server-side

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Randev',
    description: 'Randev control center',
};

// Make the component async
export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Use await here
    const headersList = await headers();
    // Read the pathname from the headers
    const header_url = headersList.get('x-url') || '';
    // const pathname = new URL(header_url).pathname; // Original line causing error

    // Safely determine the pathname
    let pathname = '/'; // Default pathname
    if (header_url) {
        try {
            // Use a dummy base URL in case header_url is relative
            const url = new URL(header_url, 'http://localhost');
            pathname = url.pathname;
        } catch (e) {
            console.error(`Invalid URL encountered in layout: ${header_url}`, e);
            // Keep default pathname "/" or handle error as needed
        }
    }

    // Determine if the current path is the login page
    const isLoginPage = pathname === '/auth/login';

    return (
        // Add the 'dark' class to html tag to enable dark mode by default
        <html lang="en" className="dark">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased dark:bg-black`}>
                {/* Conditionally render the Layout component */}
                {isLoginPage ? (
                    children // Render only children for login page
                ) : (
                    <Layout>{children}</Layout> // Wrap other pages with the Layout
                )}
            </body>
        </html>
    );
}
