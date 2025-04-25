'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { categoryService, Category } from '@/services/category.service';
import DeleteIcon from '@/components/icons/DeleteIcon';
import EditIcon from '@/components/icons/EditIcon';
import PlusIcon from '@/components/icons/PlusIcon';
import SearchIcon from '@/components/icons/SearchIcon';
import CreateCategoryModal from './components/CreateCategoryModal';
import DeleteCategoryModal from './components/DeleteCategoryModal';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedCategories = await categoryService.getAllCategories();
            setCategories(fetchedCategories);
        } catch (err) {
            setError('Failed to load categories. Please try again later.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleNewCategoryClick = () => {
        setIsCreateCategoryModalOpen(true);
    };

    const handleCategoryCreated = (newCategory: Category) => {
        setIsCreateCategoryModalOpen(false);
        setCategories((prevCategories) => [newCategory, ...prevCategories]);
    };

    const openDeleteModal = (category: Category) => {
        setCategoryToDelete(category);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteCategory = async () => {
        if (!categoryToDelete) return;

        setIsDeleting(true);
        setError(null);

        try {
            await categoryService.deleteCategory(categoryToDelete.id);
            setCategories((prevCategories) => prevCategories.filter((cat) => cat.id !== categoryToDelete.id));
            setIsDeleteModalOpen(false);
            setCategoryToDelete(null);
        } catch (err) {
            setError('Failed to delete category. Please try again.');
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditCategory = (id: string) => {
        alert(`Edit category functionality for ID ${id} not yet implemented.`);
    };

    const filteredCategories = categories.filter((category) => category.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <>
            <div className="text-gray-900 dark:text-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Categories</h1>
                        {!isLoading && !error && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <span className="font-medium text-gray-900 dark:text-gray-100">Total Categories:</span> {filteredCategories.length}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center space-x-3">
                        <Button onClick={handleNewCategoryClick} className="flex items-center text-sm bg-indigo-600 hover:bg-indigo-700 text-white">
                            <PlusIcon /> New Category
                        </Button>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-center">
                        <div className="relative w-1/3">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon />
                            </div>
                            <input
                                type="search"
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 shadow rounded-3xl overflow-hidden overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
                        <thead className="bg-gray-50 dark:bg-zinc-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={2} className="text-center py-4 px-6 text-gray-500 dark:text-gray-400">
                                        Loading categories...
                                    </td>
                                </tr>
                            ) : error && !isDeleting ? (
                                <tr>
                                    <td colSpan={2} className="text-center py-4 px-6 text-red-600 dark:text-red-400">
                                        {error}
                                    </td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="text-center py-4 px-6 text-gray-500 dark:text-gray-400">
                                        {searchTerm ? 'No categories match your search.' : 'No categories found.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{category.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
                                                <button
                                                    onClick={() => handleEditCategory(category.id)}
                                                    className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                                                    title="Edit Category"
                                                >
                                                    <EditIcon />
                                                </button>
                                                <button onClick={() => openDeleteModal(category)} className="hover:text-red-600 dark:hover:text-red-400 cursor-pointer" title="Delete Category">
                                                    <DeleteIcon />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {error && isDeleting && (
                    <div className="mt-4 p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded dark:bg-red-900 dark:text-red-300 dark:border-red-800" role="alert">
                        {error}
                    </div>
                )}
                {error && !isLoading && !isDeleting && (
                    <div className="mt-4 p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded dark:bg-red-900 dark:text-red-300 dark:border-red-800" role="alert">
                        {error}
                    </div>
                )}
            </div>

            <CreateCategoryModal isOpen={isCreateCategoryModalOpen} onClose={() => setIsCreateCategoryModalOpen(false)} onCategoryCreated={handleCategoryCreated} />
            <DeleteCategoryModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setCategoryToDelete(null);
                    setError(null);
                }}
                onConfirm={confirmDeleteCategory}
                categoryName={categoryToDelete?.name}
                isLoading={isDeleting}
            />
        </>
    );
}
