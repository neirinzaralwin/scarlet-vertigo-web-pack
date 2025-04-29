import { AnimatedGridPattern } from '@/components/magicui/animated-grid-pattern';
import MessengerIcon from '@/components/icons/messenger';
import TelegramIcon from '@/components/icons/telegram';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import DisplayProducts from '@/components/Home/DisplayProducts';
import ChatUI from '@/components/Chat/ChatUI';

export default function Home() {
    return (
        // Main container: REMOVED h-screen and overflow-hidden
        <div className="relative flex w-full items-center justify-center">
            {/* Background Pattern: Positioned absolutely behind content */}
            <AnimatedGridPattern
                numSquares={30}
                maxOpacity={0.1}
                duration={3}
                repeatDelay={1}
                className={cn(
                    '[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]',
                    'absolute inset-0 z-[-1] h-full w-full skew-y-12', // Covers container, behind content
                )}
            />
            {/* Your Widget: Placed after the background, will be centered by the parent flex container */}
            {/* Ensure body or html has the desired background color */}
            {/* <MyWidget /> */}

            <div className="z-10 grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
                <main className="flex flex-col gap-[32px] row-start-2 items-center">
                    <ChatUI />
                    <DisplayProducts />
                </main>
                <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
                    <Button className="cursor-pointer min-w-[150px]">
                        <MessengerIcon className="w-5 h-5 mr-2" /> Messenger {/* Added margin for spacing */}
                    </Button>
                    <Button className="cursor-pointer min-w-[150px]">
                        <TelegramIcon className="w-5 h-5 mr-2" /> Telegram {/* Added margin for spacing */}
                    </Button>
                </footer>
            </div>
        </div>
    );
}
