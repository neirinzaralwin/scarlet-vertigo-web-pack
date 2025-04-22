import React from 'react';

// Placeholder Icons (replace with actual icons)
const PlaceholderIcon = () => <span className="w-5 h-5">Icon</span>;
const ArrowIcon = () => <span className="w-4 h-4">↗</span>;
const EllipsisIcon = () => <span className="w-4 h-4">...</span>;

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode; // Optional icon
    secondaryValue?: string | number; // Optional secondary value like "+02"
    onArrowClick?: () => void; // Optional click handler for arrow
    onMenuClick?: () => void; // Optional click handler for ellipsis
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon = <PlaceholderIcon />, secondaryValue, onArrowClick, onMenuClick }) => {
    return (
        // Revert to rounded-3xl, adjust padding and background
        <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-3xl shadow-md border border-gray-200 dark:border-zinc-700 flex flex-col justify-between h-full">
            {/* Top Row: Icon, Title, Arrow Button */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    {icon}
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
                </div>
                {onArrowClick && (
                    <button onClick={onArrowClick} className="bg-gray-200 dark:bg-zinc-700 rounded-full p-1.5 hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors" aria-label="View details">
                        <ArrowIcon />
                    </button>
                )}
            </div>

            {/* Bottom Row: Value, Secondary Value, Ellipsis */}
            <div className="flex justify-between items-end">
                <div className="flex items-baseline gap-1">
                    {/* Apply JUST Sans font specifically to the main value */}
                    <p className="text-3xl font-semibold font-just-sans text-gray-900 dark:text-gray-100">{value}</p>
                    {secondaryValue && <span className="text-xs font-medium text-gray-500 dark:text-gray-400 relative bottom-1">{secondaryValue}</span>}
                </div>
                {onMenuClick && (
                    <button onClick={onMenuClick} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1" aria-label="More options">
                        <EllipsisIcon />
                    </button>
                )}
            </div>
        </div>
    );
};

export default StatCard;
