import { AnimatedGridPattern } from '@/components/magicui/animated-grid-pattern';
import MessengerIcon from '@/components/icons/messenger';
import TelegramIcon from '@/components/icons/telegram';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import DisplayProducts from '@/components/Home/DisplayProducts';

// // Placeholder for your widget component
// const MyWidget = () => {
//     return (
//         <div className="z-10 p-6 bg-card rounded-lg shadow-lg border">
//             <h2 className="text-lg font-semibold mb-4">My Widget</h2>
//             <p className="text-sm text-muted-foreground mb-4">This is where the widget content goes.</p>
//             <div className="flex gap-2">
//                 <Button variant="outline" size="sm">
//                     Action 1
//                 </Button>
//                 <Button size="sm">Action 2</Button>
//             </div>
//         </div>
//     );
// };

export default function Home() {
    return (
        // Main container: REMOVED bg-background
        <div className="relative flex h-screen w-full items-center justify-center overflow-hidden">
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
                <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
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
