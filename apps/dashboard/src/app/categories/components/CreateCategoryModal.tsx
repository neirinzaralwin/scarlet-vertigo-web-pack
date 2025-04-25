'use client';

import React, { useState } from 'react';
import Button from '@/components/Button';
import { categoryService, Category } from '@/services/category.service';

interface CreateCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCategoryCreated: (newCategory: Category) => void;
}

export default function CreateCategoryModal({ isOpen, onClose, onCategoryCreated }: CreateCategoryModalProps) {
    const [categoryName, setCategoryName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryName.trim()) {
            setError('Category name cannot be empty.');
            return;
        }
        setError(null);
        setIsLoading(true);

        try {
            const newCategory = await categoryService.createCategory(categoryName);
            onCategoryCreated(newCategory); // Pass the new category back
            setCategoryName(''); // Reset input
            onClose(); // Close modal on success
        } catch (err) {
            console.error('Failed to create category:', err);
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setCategoryName(''); // Reset state on close
        setError(null);
        onClose();
    };

    // Handle clicks on the background overlay
    const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Check if the click target is the overlay itself, not its children
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm"
            onClick={handleBackgroundClick} // Add onClick handler to the overlay
        >
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-xl w-full max-w-md border border-zinc-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Create New Category</h2>
                    <button onClick={handleClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                        &times;
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded dark:bg-red-900 dark:text-red-300 dark:border-red-800" role="alert">
                            {error}
                        </div>
                    )}
                    <div className="mb-4">
                        <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Category Name
                        </label>
                        <input
                            id="categoryName"
                            type="text"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            placeholder="Enter category name"
                            required
                            className="block w-full px-3 py-2 mt-1 text-gray-900 bg-white dark:bg-gray-700 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex justify-end space-x-3">
                        <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {isLoading ? 'Creating...' : 'Create Category'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
