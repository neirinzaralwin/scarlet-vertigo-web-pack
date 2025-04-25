'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import HomeIcon from './icons/HomeIcon';
import CatalogIcon from './icons/CatalogIcon';
import CategoryIcon from './icons/CategoryIcon';
import FinanceIcon from './icons/FinanceIcon';
import CustomerIcon from './icons/CustomerIcon';
import MarketingIcon from './icons/MarketingIcon';
import DotIcon from './icons/DotIcon';
import SearchIcon from './icons/SearchIcon';
import LogoutIcon from './icons/LogoutIcon';
import { removeAuthCookie } from '@/utils/authCookies';
import { authService } from '@/services/auth.service';
import Button from './Button';

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    subItems?: NavItem[];
}

const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    {
        name: 'Product',
        href: '/products',
        icon: CatalogIcon,
        subItems: [
            { name: 'All', href: '/products', icon: DotIcon },
            { name: 'Create', href: '/products/create', icon: DotIcon },
        ],
    },
    {
        name: 'Category',
        href: '/categories',
        icon: CategoryIcon,
        subItems: [{ name: 'All', href: '/categories', icon: DotIcon }],
    },
    { name: 'Finances', href: '/finances', icon: FinanceIcon },
    { name: 'Customers', href: '/customers', icon: CustomerIcon },
    { name: 'Marketing', href: '/marketing', icon: MarketingIcon },
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

const Sidebar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [openDropdown, setOpenDropdown] = useState<string | null>(() => {
        const activeParent = navigation.find((item) => item.subItems?.some((subItem) => pathname === subItem.href));
        return activeParent ? activeParent.name : null;
    });
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleDropdownToggle = (name: string) => {
        setOpenDropdown(openDropdown === name ? null : name);
    };

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        authService.logout();
        removeAuthCookie();
        setShowLogoutConfirm(false);
        router.push('/auth/login');
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    return (
        <div className="flex flex-col w-64 h-screen px-4 py-8 bg-white dark:bg-black">
            <div className="flex items-center justify-start mb-8 px-2">
                <span className="text-xl font-bold text-gray-800 dark:text-white">Randev</span>
            </div>

            {/* Search Input */}
            <div className="mb-6 px-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                    type="search"
                    placeholder="Search"
                    className="w-full pl-9 pr-4 py-2 text-sm leading-tight text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-zinc-700 rounded-md bg-gray-50 dark:bg-zinc-800"
                />
            </div>

            <nav className="flex-1 space-y-4">
                <div>
                    <h3 className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">General</h3>

                    <div className="space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isParentActive = item.subItems ? pathname.startsWith(item.href) : pathname === item.href;
                            const isOpen = openDropdown === item.name;

                            return (
                                <div key={item.name}>
                                    {item.subItems ? (
                                        <>
                                            <button
                                                onClick={() => handleDropdownToggle(item.name)}
                                                className={classNames(
                                                    isParentActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
                                                    'group flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer',
                                                )}
                                            >
                                                <div className="flex items-center">
                                                    <Icon className="mr-3 flex-shrink-0 h-5 w-5" aria-hidden="true" />
                                                    {item.name}
                                                </div>
                                                <svg
                                                    className={`w-4 h-4 transform transition-transform duration-150 ${isOpen ? 'rotate-90' : ''}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                                </svg>
                                            </button>
                                            {isOpen && (
                                                <div className="pl-6 mt-1 space-y-1 border-l border-gray-200 dark:border-zinc-700 ml-[1.3rem]">
                                                    {item.subItems.map((subItem) => {
                                                        const SubIcon = subItem.icon;
                                                        const isSubActive = pathname === subItem.href;
                                                        return (
                                                            <Link
                                                                key={subItem.name}
                                                                href={subItem.href}
                                                                className={classNames(
                                                                    isSubActive
                                                                        ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white'
                                                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white',
                                                                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md relative -ml-3',
                                                                )}
                                                            >
                                                                <SubIcon
                                                                    className={classNames(
                                                                        isSubActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500',
                                                                        'mr-3 flex-shrink-0 h-2 w-2',
                                                                    )}
                                                                    aria-hidden="true"
                                                                />
                                                                {subItem.name}
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            className={classNames(
                                                isParentActive
                                                    ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white',
                                                'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
                                            )}
                                        >
                                            <Icon className="mr-3 flex-shrink-0 h-5 w-5" aria-hidden="true" />
                                            {item.name}
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Logout Button Area */}
            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-zinc-700">
                <button
                    onClick={handleLogoutClick}
                    className="group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                >
                    <LogoutIcon className="mr-3 flex-shrink-0 h-5 w-5" aria-hidden="true" />
                    Logout
                </button>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Confirm Logout</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to log out?</p>
                        <div className="flex justify-end space-x-3">
                            <Button onClick={cancelLogout} variant="secondary" className="w-auto">
                                Cancel
                            </Button>
                            <Button onClick={confirmLogout} variant="danger" className="w-auto">
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
