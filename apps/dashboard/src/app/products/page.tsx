'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { productService, Product, GetProductsResponse } from '@/services/product.service';
import Button from '@/components/Button';
import SearchIcon from '@/components/icons/SearchIcon';
import EditIcon from '@/components/icons/EditIcon';
import DeleteIcon from '@/components/icons/DeleteIcon';

export default function ProductsPage() {
    const [productsResponse, setProductsResponse] = useState<GetProductsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await productService.getProducts();
                setProductsResponse(data);
            } catch (err) {
                console.error('Failed to fetch products:', err);
                setError(err instanceof Error ? err.message : 'Failed to load products.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete product "${name}"?`)) {
            setIsLoading(true); // Indicate loading state during delete
            setError(null);
            try {
                await productService.deleteProduct(id);
                // Refetch products after successful deletion
                const data = await productService.getProducts();
                setProductsResponse(data);
                alert(`Product "${name}" deleted successfully.`); // Replace with better notification
            } catch (err) {
                console.error('Failed to delete product:', err);
                setError(err instanceof Error ? err.message : 'Failed to delete product.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    if (isLoading && !productsResponse) {
        // Show loading only initially
        return <div className="p-6 text-center">Loading products...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-600 dark:text-red-400">Error loading products: {error}</div>;
    }

    if (!productsResponse || productsResponse.products.length === 0) {
        return (
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Products</h1>
                    <Link href="/products/create">
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white">Create Product</Button>
                    </Link>
                </div>
                <p className="text-center text-gray-500 dark:text-gray-400">No products found.</p>
            </div>
        );
    }

    const { products, total } = productsResponse;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Products</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span className="font-medium text-gray-900 dark:text-gray-100">Total products:</span> {total}
                    </p>
                </div>
                <Link href="/products/create">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white">Create Product</Button>
                </Link>
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
                        <input type="search" placeholder="Search" className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-sm" />
                    </div>
                    <select className="px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-sm">
                        <option>All Products</option>
                    </select>
                </div>
            </div>

            {/* Display API error during delete */}
            {error && (
                <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded dark:bg-red-900 dark:text-red-300 dark:border-red-800" role="alert">
                    {error}
                </div>
            )}

            {/* Products Table */}
            <div className="overflow-x-auto bg-white dark:bg-zinc-900 rounded-lg shadow border border-zinc-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
                    <thead className="bg-gray-50 dark:bg-zinc-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Image
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Category
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Price
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Stock
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-700">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex-shrink-0 h-10 w-10">
                                        {product.images && product.images.length > 0 ? (
                                            <img className="h-10 w-10 rounded-full object-cover" src={product.images[0].url} alt={product.name} />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">No Img</div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.name}</div>
                                    {/* Optional: Show description snippet */}
                                    {/* <div className="text-xs text-gray-500 dark:text-gray-400 truncate w-40">{product.description}</div> */}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.category?.name || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">฿{product.price ? parseFloat(String(product.price)).toFixed(2) : 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.stock} g</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <Link
                                        href={`/products/edit/${product.id}`}
                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 inline-flex items-center"
                                    >
                                        <EditIcon />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(product.id, product.name)}
                                        disabled={isLoading} // Disable button during any loading operation
                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        <DeleteIcon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* TODO: Add Pagination if needed based on 'total' */}
        </div>
    );
}
