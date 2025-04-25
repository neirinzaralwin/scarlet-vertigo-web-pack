import React from 'react';
import NotificationIcon from './icons/NotificationIcon';

const UserAvatar = () => (
    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
        {/* Placeholder for user image or initials */}
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300"></span>
        {/* Or use an img tag: <img src="/path/to/avatar.jpg" alt="User Avatar" className="w-full h-full rounded-full object-cover" /> */}
    </div>
);

const Header: React.FC = () => {
    return (
        <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-black border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10">
            {/* Left side - Title */}
            <div></div>
            {/* Right side - Search, Notifications, User Menu */}
            <div className="flex items-center space-x-4">
                {/* Notification Button */}
                <button className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <NotificationIcon />
                </button>

                {/* User Avatar/Menu Trigger */}
                <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <UserAvatar />
                </button>
            </div>{' '}
            {/* Closing tag was missing here */}
        </header>
    );
};

export default Header;
