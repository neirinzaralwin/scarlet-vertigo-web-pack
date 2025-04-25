'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Import useRouter
import Button from '@/components/Button';
import { productService, Product } from '@/services/product.service';
// Import the new icon components
import EditIcon from '@/components/icons/EditIcon';
import ViewIcon from '@/components/icons/ViewIcon';
import MoreIcon from '@/components/icons/MoreIcon';
import SearchIcon from '@/components/icons/SearchIcon';
import PlusIcon from '@/components/icons/PlusIcon';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [totalProducts, setTotalProducts] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter(); // Initialize useRouter

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const fetchedProducts = await productService.getProducts();
                setProducts(fetchedProducts.products);
                setTotalProducts(fetchedProducts.total);
            } catch (err) {
                setError('Failed to load products. Please try again later.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleNewProductClick = () => {
        router.push('/products/create'); // Navigate to create product page
    };

    return (
        <div className="text-gray-900 dark:text-gray-100">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Products</h1>
                    {!isLoading && !error && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <span className="font-medium text-gray-900 dark:text-gray-100">Total Products:</span> {totalProducts}
                        </p>
                    )}
                </div>

                <div className="flex items-center space-x-3">
                    <Button
                        onClick={handleNewProductClick} // Add onClick handler
                        className="flex items-center text-sm bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        <PlusIcon /> New Product
                    </Button>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <button className="hover:text-gray-900 dark:hover:text-white">Manage Comments</button>
                    <button className="hover:text-gray-900 dark:hover:text-white">Library Sorting</button>
                </div>

                <div className="flex justify-between items-center">
                    <div className="relative w-1/3">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon />
                        </div>
                        <input
                            type="search"
                            placeholder="Search"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-sm"
                        />
                    </div>
                    <select className="px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-sm">
                        <option>All Products</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 shadow rounded-3xl overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
                    <thead className="bg-gray-50 dark:bg-zinc-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Products
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Price
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Stock
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Created At
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-700">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="text-center py-4 px-6 text-gray-500 dark:text-gray-400">
                                    Loading products...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={5} className="text-center py-4 px-6 text-red-600 dark:text-red-400">
                                    {error}
                                </td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-4 px-6 text-gray-500 dark:text-gray-400">
                                    No products found.
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 mr-4">
                                                <div className="h-10 w-10 rounded-md bg-gray-200 dark:bg-zinc-700 flex items-center justify-center overflow-hidden">
                                                    {product.images && product.images.length > 0 && product.images[0] ? (
                                                        <Image src={product.images[0]} alt={product.name} width={40} height={40} className="object-cover w-full h-full" />
                                                    ) : (
                                                        <span className="text-xs text-gray-500">IMG</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.price)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.stock ?? 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(product.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
                                            <button className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
                                                <EditIcon />
                                            </button>
                                            <button className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
                                                <ViewIcon />
                                            </button>
                                            <button className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
                                                <MoreIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
