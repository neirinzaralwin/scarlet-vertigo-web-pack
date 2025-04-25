'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { z } from 'zod';
import Button from '@/components/Button';
import { categoryService, Category } from '@/services/category.service';
import { sizeService, Size } from '@/services/size.service';
import CategorySelector from './components/CategorySelector';
import SizeSelector from './components/SizeSelector';
import CreateCategoryModal from './components/CreateCategoryModal'; // Import the modal

// Define Zod schema for the form data
const CreateProductFormSchema = z.object({
    productName: z.string().min(1, 'Product name is required'),
    description: z.string().optional(),
    price: z.preprocess((val) => parseFloat(String(val)), z.number().positive('Price must be positive')),
    stock: z.preprocess((val) => parseInt(String(val), 10), z.number().int().min(0, 'Stock cannot be negative')),
    categoryId: z.string().min(1, 'Category is required'),
    sizeId: z.string().optional(),
});

type CreateProductFormData = z.infer<typeof CreateProductFormSchema>;
type FileWithPreview = File & { preview: string };

export default function CreateProductPage() {
    // State for form fields
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [files, setFiles] = useState<FileWithPreview[]>([]); // State for files with previews

    // Category state
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categorySearchTerm, setCategorySearchTerm] = useState('');

    // Size state
    const [sizes, setSizes] = useState<Size[]>([]);
    const [selectedSizeId, setSelectedSizeId] = useState<string>(''); // Store only the ID, empty string means no selection

    // State for validation errors
    const [errors, setErrors] = useState<Partial<Record<keyof CreateProductFormData, string>>>({});
    // State for API errors
    const [apiError, setApiError] = useState<string | null>(null);
    // State for loading
    const [isLoading, setIsLoading] = useState(false);

    // State for Create Category Modal
    const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);

    // Dropzone configuration
    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles((prevFiles) => [
            ...prevFiles,
            ...acceptedFiles.map((file) =>
                Object.assign(file, {
                    preview: URL.createObjectURL(file),
                }),
            ),
        ]);
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } }); // Accept only images

    // Clean up preview URLs on unmount and when files change
    useEffect(() => {
        // Make sure to revoke the data uris to avoid memory leaks
        return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
    }, [files]);

    // Fetch categories and sizes on mount
    const fetchCategories = useCallback(async () => {
        try {
            const fetchedCategories = await categoryService.getAllCategories();
            setCategories(fetchedCategories);
            return fetchedCategories; // Return fetched data
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            setApiError('Failed to load categories.'); // Show error to user
            return []; // Return empty array on error
        }
    }, []); // Add dependencies if needed, empty means run once

    const fetchSizes = useCallback(async () => {
        try {
            const fetchedSizes = await sizeService.getAllSizes();
            setSizes(fetchedSizes);
        } catch (error) {
            console.error('Failed to fetch sizes:', error);
            setApiError('Failed to load sizes.'); // Show error to user
        }
    }, []); // Add dependencies if needed, empty means run once

    useEffect(() => {
        fetchCategories();
        fetchSizes();
    }, [fetchCategories, fetchSizes]); // Depend on the memoized fetch functions

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setApiError(null);
        setIsLoading(true);

        const formData = {
            productName,
            description,
            price: price, // Keep as string for validation, schema handles parsing
            stock: stock, // Keep as string for validation, schema handles parsing
            categoryId: selectedCategory?.id || '',
            sizeId: selectedSizeId || undefined, // Include selected size ID, pass undefined if empty
        };

        const validationResult = CreateProductFormSchema.safeParse(formData);

        if (!validationResult.success) {
            const fieldErrors: Partial<Record<keyof CreateProductFormData, string>> = {};
            validationResult.error.errors.forEach((err) => {
                if (err.path[0]) {
                    // Assign error message to the corresponding field key
                    fieldErrors[err.path[0] as keyof CreateProductFormData] = err.message;
                }
            });
            setErrors(fieldErrors);
            setIsLoading(false);
            return;
        }

        // If validation succeeds, proceed with API call
        try {
            // TODO: Implement API call to create product using validationResult.data
            // Include files in the API call payload, likely as FormData
            const productData = validationResult.data;
            console.log('Validated Form Data:', productData);
            console.log('Uploaded Files:', files);
            // Example:
            // const formDataApi = new FormData();
            // formDataApi.append('productName', productData.productName);
            // formDataApi.append('description', productData.description || '');
            // formDataApi.append('price', String(productData.price));
            // formDataApi.append('stock', String(productData.stock));
            // formDataApi.append('categoryId', productData.categoryId);
            // if (productData.sizeId) formDataApi.append('sizeId', productData.sizeId);
            // files.forEach(file => formDataApi.append('images', file));
            // await productService.createProduct(formDataApi);
            // Handle success (e.g., redirect or show success message)

        } catch (error) {
            console.error('Product creation failed:', error);
            setApiError(error instanceof Error ? error.message : 'An unexpected error occurred during product creation.');
        } finally {
            setIsLoading(false);
        }
    };

    // Function to remove a file
    const removeFile = (fileName: string) => {
        setFiles((prevFiles) => {
            const newFiles = prevFiles.filter((file) => file.name !== fileName);
            // Find the removed file to revoke its URL
            const removedFile = prevFiles.find((file) => file.name === fileName);
            if (removedFile) {
                URL.revokeObjectURL(removedFile.preview);
            }
            return newFiles;
        });
    };

    // Handle category selection (updated to clear error)
    const handleCategorySelect = (category: Category) => {
        setSelectedCategory(category);
        setCategorySearchTerm(category.name); // Update search term to selected category name
        setErrors((prev) => ({ ...prev, categoryId: undefined })); // Clear potential validation error
    };

    // Handler to open the create category modal
    const handleOpenCreateCategoryModal = () => {
        setIsCreateCategoryModalOpen(true);
    };

    // Handler for when a new category is successfully created
    const handleCategoryCreated = async (newCategory: Category) => {
        setIsCreateCategoryModalOpen(false); // Close modal
        // Refetch categories to include the new one
        const updatedCategories = await fetchCategories();
        // Find the newly created category in the updated list
        const newlyCreated = updatedCategories.find(cat => cat.id === newCategory.id);
        if (newlyCreated) {
            setSelectedCategory(newlyCreated); // Select the new category
            setCategorySearchTerm(newlyCreated.name); // Update search term
            setErrors((prev) => ({ ...prev, categoryId: undefined })); // Clear potential validation error
        }
    };

    return (
        <> {/* Use Fragment to wrap form and modal */}
            <form onSubmit={handleSubmit} className="space-y-8 text-gray-900 dark:text-gray-100">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold">Create Product</h1>
                    <Button type="submit" disabled={isLoading} className="bg-orange-500 hover:bg-orange-600 text-white">
                        {isLoading ? 'Creating...' : 'Create Product'}
                    </Button>
                </div>
                {/* Display API Error */}
                {apiError && (
                    <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded dark:bg-red-900 dark:text-red-300 dark:border-red-800" role="alert">
                        {apiError}
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column (Main Details) */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Product Section */}
                        <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow border border-zinc-700">
                            {/* Product Name input */}
                            <div>
                                <label htmlFor="productName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Product Name
                                </label>
                                <input
                                    id="productName"
                                    type="text"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    placeholder="Product Name"
                                    required
                                    className={`block w-full px-3 py-2 mt-1 text-gray-900 bg-white dark:bg-gray-700 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border ${errors.productName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm appearance-none sm:text-sm`}
                                />
                                {errors.productName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.productName}</p>}
                            </div>
                            {/* Description textarea */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    rows={6}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className={`w-full p-2 border ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-zinc-700'} rounded-md bg-white dark:bg-zinc-800 text-sm`}
                                    placeholder="Product description..."
                                />
                                {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>}
                            </div>
                            {/* Images Dropzone */}
                            <h2 className="text-lg font-medium mt-6 mb-4">IMAGES</h2>
                            <div
                                {...getRootProps()}
                                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${isDragActive ? 'border-indigo-500' : 'border-gray-300 dark:border-zinc-700'} border-dashed rounded-md cursor-pointer`}
                            >
                                <input {...getInputProps()} />
                                <div className="space-y-1 text-center">
                                    {/* SVG icon */}
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                        <p className="pl-1">
                                            {isDragActive ? (
                                                'Drop the files here ...'
                                            ) : (
                                                <>
                                                    Drag 'n' drop some files here, or <span className="text-blue-500 dark:text-blue-400">click to select files</span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                </div>
                            </div>
                            {/* File Previews */}
                            {files.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploaded files:</h3>
                                    <ul className="divide-y divide-gray-200 dark:divide-zinc-700 grid grid-cols-3 gap-2 pt-2">
                                        {files.map((file) => (
                                            <li key={file.name} className="relative aspect-square border dark:border-zinc-700 rounded overflow-hidden">
                                                <img
                                                    src={file.preview}
                                                    alt={`Preview of ${file.name}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(file.name)}
                                                    className="absolute top-1 right-1 p-0.5 bg-red-600 bg-opacity-70 rounded-full text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                                    aria-label={`Remove ${file.name}`}
                                                >
                                                    {/* remove icon SVG */}
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        {/* Pricing Section */}
                        <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow border border-zinc-700">
                            <h2 className="text-lg font-medium mb-4">PRICING</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Price input */}
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Price (Baht)
                                    </label>
                                    <input
                                        id="price"
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="eg. 30 baht"
                                        step="0.01"
                                        required
                                        className={`block w-full px-3 py-2 mt-1 text-gray-900 bg-white dark:bg-gray-700 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border ${errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm appearance-none sm:text-sm`}
                                    />
                                    {errors.price && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.price}</p>}
                                </div>
                                {/* Stock input */}
                                <div>
                                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Stock (g)
                                    </label>
                                    <input
                                        id="stock"
                                        type="number"
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                        placeholder="eg. 20g"
                                        step="1"
                                        required
                                        className={`block w-full px-3 py-2 mt-1 text-gray-900 bg-white dark:bg-gray-700 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border ${errors.stock ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm appearance-none sm:text-sm`}
                                    />
                                    {errors.stock && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.stock}</p>}
                                </div>
                            </div>
                        </div>
                    </div> {/* End Left Column Div */}

                    {/* Right Column (Status & Organization) */}
                    <div className="space-y-6">
                        {/* Category Section */}
                        <CategorySelector
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onSelectCategory={handleCategorySelect}
                            searchTerm={categorySearchTerm}
                            onSearchTermChange={setCategorySearchTerm}
                            onCreateNewCategory={handleOpenCreateCategoryModal} // Pass the handler to open modal
                            error={errors.categoryId}
                            disabled={isLoading}
                        />

                        {/* Size Section */}
                        <SizeSelector
                            sizes={sizes}
                            selectedSizeId={selectedSizeId}
                            onChange={setSelectedSizeId}
                            error={errors.sizeId}
                            disabled={isLoading}
                        />
                    </div>
                </div>
            </form>

            {/* Create Category Modal - Corrected JSX syntax */}
            <CreateCategoryModal
                isOpen={isCreateCategoryModalOpen}
                onClose={() => setIsCreateCategoryModalOpen(false)}
                onCategoryCreated={handleCategoryCreated}
            />
        </>
    );
}
