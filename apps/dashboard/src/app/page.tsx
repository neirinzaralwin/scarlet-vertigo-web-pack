'use client';

import StatCard from '@/components/StatCard'; // Import the StatCard component
// Import desired icons
import CatalogIcon from '@/components/icons/CatalogIcon';
import FinanceIcon from '@/components/icons/FinanceIcon';
// Import other icons as needed...

export default function DashboardPage() {
    // Example click handlers (replace with actual logic)
    const handleArrowClick = (title: string) => {
        console.log(`Arrow clicked for ${title}`);
    };
    const handleMenuClick = (title: string) => {
        console.log(`Menu clicked for ${title}`);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
            </div>

            {/* Use the reusable StatCard component with icons and handlers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Products"
                    value="1,525"
                    icon={<CatalogIcon className="w-5 h-5 text-zinc-500" />} // Pass CatalogIcon
                    secondaryValue="+10"
                    onArrowClick={() => handleArrowClick('Products')}
                    onMenuClick={() => handleMenuClick('Products')}
                />
                <StatCard
                    title="Total Sales"
                    value="10,892"
                    icon={<FinanceIcon className="w-5 h-5 text-zinc-500" />} // Pass FinanceIcon
                    secondaryValue="+5%"
                    onArrowClick={() => handleArrowClick('Sales')}
                    onMenuClick={() => handleMenuClick('Sales')}
                />
                <StatCard
                    title="Total Income"
                    value="$157,342"
                    icon={<FinanceIcon className="w-5 h-5 text-zinc-500" />} // Pass FinanceIcon
                    secondaryValue="+$2k"
                    onArrowClick={() => handleArrowClick('Income')}
                    onMenuClick={() => handleMenuClick('Income')}
                />
                <StatCard
                    title="Total Expenses"
                    value="$12,453"
                    icon={<FinanceIcon className="w-5 h-5 text-zinc-500" />} // Pass FinanceIcon
                    secondaryValue="-$500"
                    onArrowClick={() => handleArrowClick('Expenses')}
                    onMenuClick={() => handleMenuClick('Expenses')}
                />
                {/* Add more cards by reusing StatCard */}
            </div>

            {/* Add charts, tables etc. below */}
            {/* Updated Styles for Recent Activity */}
            <div className="mt-6 bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-md border border-gray-100 dark:border-zinc-800">
                <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                {/* Placeholder for recent activity list */}
                <p className="text-gray-600 dark:text-gray-400">Activity items will go here...</p>
            </div>
        </div>
    );
}
