'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Category } from '@/services/category.service';

interface CategorySelectorProps {
    categories: Category[];
    selectedCategory: Category | null;
    onSelectCategory: (category: Category) => void;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    error?: string;
    disabled?: boolean;
}

export default function CategorySelector({ categories, selectedCategory, onSelectCategory, searchTerm, onSearchTermChange, error, disabled = false }: CategorySelectorProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Handle clicks outside the dropdown to close it
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    // Filter categories based on search term
    const filteredCategories = categories.filter((category) => category.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSelect = (category: Category) => {
        onSelectCategory(category);
        onSearchTermChange(category.name); // Update search input with selected name
        setIsDropdownOpen(false); // Close dropdown
    };

    return (
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow border border-zinc-700" ref={dropdownRef}>
            <h2 className="text-lg font-medium mb-4">Category</h2>
            <div className="relative">
                <label htmlFor="categorySearch" className="sr-only">
                    Search Category
                </label>
                <input
                    id="categorySearch"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        onSearchTermChange(e.target.value);
                        // If user clears input or types something different than selected, clear selection
                        if (!selectedCategory || e.target.value !== selectedCategory.name) {
                            // Optionally clear the parent's selectedCategory state here if needed
                            // This depends on desired UX. For now, just allow typing.
                        }
                        setIsDropdownOpen(true); // Open dropdown when typing
                    }}
                    onFocus={() => setIsDropdownOpen(true)} // Open dropdown on focus
                    placeholder="Search or select category"
                    disabled={disabled}
                    className={`block w-full px-3 py-2 mt-1 text-gray-900 bg-white dark:bg-gray-700 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm appearance-none sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}

                {isDropdownOpen && !disabled && filteredCategories.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredCategories.map((category) => (
                            <li
                                key={category.id}
                                onClick={() => handleSelect(category)}
                                className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                            >
                                {category.name}
                            </li>
                        ))}
                    </ul>
                )}
                {isDropdownOpen && !disabled && filteredCategories.length === 0 && searchTerm && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg p-3 text-sm text-gray-500 dark:text-gray-400">
                        No categories found matching "{searchTerm}".
                    </div>
                )}
            </div>
        </div>
    );
}
