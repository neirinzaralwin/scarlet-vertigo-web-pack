'use client';

import React from 'react';
import Button from '@/components/Button';

interface DeleteCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    categoryName: string | undefined; // Allow undefined initially
    isLoading: boolean;
}

export default function DeleteCategoryModal({ isOpen, onClose, onConfirm, categoryName, isLoading }: DeleteCategoryModalProps) {
    // Handle clicks on the background overlay
    const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm" onClick={handleBackgroundClick}>
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-xl w-full max-w-md border border-zinc-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Confirm Deletion</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" disabled={isLoading}>
                        &times;
                    </button>
                </div>
                <div className="mb-6">
                    <p className="text-sm text-gray-700 dark:text-gray-300">Are you sure you want to delete the category "{categoryName || 'this category'}"? This action cannot be undone.</p>
                </div>
                <div className="flex justify-end space-x-3">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="button" variant="danger" onClick={onConfirm} disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white">
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
