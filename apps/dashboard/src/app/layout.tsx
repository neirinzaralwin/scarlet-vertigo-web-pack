import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import AppLayout from '@/components/AppLayout'; // Import the new client wrapper

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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // Add the 'dark' class to html tag to enable dark mode by default
        <html lang="en" className="dark">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased dark:bg-black`}>
                {/* Use the AppLayout client component to handle conditional layout */}
                <AppLayout>{children}</AppLayout>
            </body>
        </html>
    );
}
