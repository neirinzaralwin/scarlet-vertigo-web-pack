import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="flex items-center justify-between h-16 px-6 bg-gray-100 dark:bg-black border-b dark:border-black">
            {/* Placeholder for Search, Notifications, User Menu */}
            <div className="flex items-center">
                {/* Search Input (optional) */}
                {/* <input type="search" placeholder="Search anything..." className="..."/> */}
            </div>
            <div className="flex items-center space-x-4">
                {/* Icons/User Menu */}
                <span>🔔</span> {/* Placeholder */}
                <span>👤</span> {/* Placeholder */}
            </div>
        </header>
    );
};

export default Header;
