import { AnimatedGridPattern } from '@/components/magicui/animated-grid-pattern';
import MessengerIcon from '@/components/icons/messenger';
import TelegramIcon from '@/components/icons/telegram';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import DisplayProducts from '@/components/Home/DisplayProducts';
import ChatUI from '@/components/Chat/ChatUI';
// Import necessary components from sidebar UI
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

export default function Home() {
    return (
        // Main container
        <div className="relative flex w-full items-center justify-center">
            {/* Background Pattern */}
            <AnimatedGridPattern
                numSquares={30}
                maxOpacity={0.1}
                duration={3}
                repeatDelay={1}
                className={cn('[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]', 'absolute inset-0 z-[-1] h-full w-full skew-y-12')}
            />

            {/* SidebarProvider wraps Sidebar and SidebarInset */}
            <SidebarProvider>
                {/* AppSidebar goes here, outside the inset */}
                <AppSidebar />

                {/* SidebarInset wraps the main content and footer */}
                <SidebarInset className="flex flex-col min-h-screen p-4 sm:p-8">
                    {' '}
                    {/* Added flex flex-col and padding */}
                    {/* Header area within the inset */}
                    <header className="flex items-center gap-2 mb-4">
                        {' '}
                        {/* Added header for trigger */}
                        <SidebarTrigger /> {/* Add the trigger button */}
                        {/* You could add other header elements here */}
                    </header>
                    {/* Main content area */}
                    {/* Removed grid layout classes, SidebarInset handles positioning */}
                    <main className="flex flex-col gap-8 flex-grow items-center">
                        {' '}
                        {/* Added flex-grow */}
                        <ChatUI />
                        <DisplayProducts />
                    </main>
                    {/* Footer area */}
                    {/* Removed grid layout classes */}
                    <footer className="flex gap-4 flex-wrap items-center justify-center mt-8">
                        {' '}
                        {/* Adjusted spacing */}
                        <Button className="cursor-pointer min-w-[150px]">
                            <MessengerIcon className="w-5 h-5 mr-2" /> Messenger
                        </Button>
                        <Button className="cursor-pointer min-w-[150px]">
                            <TelegramIcon className="w-5 h-5 mr-2" /> Telegram
                        </Button>
                    </footer>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}
