'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { z } from 'zod';
import Button from '@/components/Button';
import { categoryService, Category } from '@/services/category.service';
import { sizeService, Size } from '@/services/size.service';
import CategorySelector from '@/app/products/create/components/CategorySelector'; // Adjust path if needed
import SizeSelector from '@/app/products/create/components/SizeSelector'; // Adjust path if needed
import CreateCategoryModal from '@/app/categories/components/CreateCategoryModal';
import { Product, CreateProductPayload, UpdateProductPayload, productService } from '@/services/product.service'; // Import Product types
import { useRouter } from 'next/navigation'; // Import useRouter

// Define Zod schema for the form data (client-side validation)
const ProductFormSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    description: z.string().optional(),
    price: z.preprocess((val) => parseFloat(String(val)), z.number().positive('Price must be positive')),
    stock: z.preprocess((val) => parseInt(String(val), 10), z.number().int().min(0, 'Stock cannot be negative')),
    categoryId: z.string().optional(),
    sizeId: z.string().optional(),
    // Files are handled separately
});

type ProductFormData = z.infer<typeof ProductFormSchema>;
type FileWithPreview = File & { preview: string };
type ExistingImage = { id: string; url: string }; // Type for existing images

interface ProductFormProps {
    initialData?: Product | null; // Product data for editing
    isLoading?: boolean;
    apiError?: string | null;
    onSubmitSuccess?: () => void; // Optional callback on success
}

export default function ProductForm({ initialData = null, isLoading: externalLoading = false, apiError: externalError = null, onSubmitSuccess }: ProductFormProps) {
    const router = useRouter();
    const isEditMode = !!initialData;

    // State for form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [newFiles, setNewFiles] = useState<FileWithPreview[]>([]); // State for NEW files to upload
    const [existingImages, setExistingImages] = useState<ExistingImage[]>([]); // State for existing images (edit mode)

    // Category state
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categorySearchTerm, setCategorySearchTerm] = useState('');

    // Size state
    const [sizes, setSizes] = useState<Size[]>([]);
    const [selectedSizeId, setSelectedSizeId] = useState<string>('');

    // State for validation errors
    const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});
    // State for API errors (internal to component if not provided)
    const [internalApiError, setInternalApiError] = useState<string | null>(null);
    // State for loading (internal to component if not provided)
    const [internalIsLoading, setInternalIsLoading] = useState(false);

    // Use external state if provided, otherwise use internal state
    const apiError = externalError ?? internalApiError;
    const isLoading = externalLoading || internalIsLoading;

    // State for Create Category Modal
    const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);

    // Populate form with initial data in edit mode
    useEffect(() => {
        if (isEditMode && initialData) {
            setName(initialData.name || '');
            setDescription(initialData.description || '');
            setPrice(String(initialData.price) || ''); // Convert Decimal128/number to string
            setStock(String(initialData.stock) || ''); // Convert number to string
            setExistingImages(initialData.images || []);

            // Set initial category if available
            if (initialData.category) {
                // Ensure categories are loaded before setting
                if (categories.length > 0) {
                    const initialCat = categories.find((cat) => cat.id === initialData.category?.id);
                    if (initialCat) {
                        setSelectedCategory(initialCat);
                        setCategorySearchTerm(initialCat.name);
                    }
                }
                // If categories not loaded yet, this will be handled by the fetchCategories effect
            } else {
                setSelectedCategory(null);
                setCategorySearchTerm('');
            }

            // Set initial size if available
            setSelectedSizeId(initialData.size?.id || '');
        }
    }, [initialData, isEditMode, categories]); // Add categories dependency

    // Dropzone configuration for new files
    const onDrop = useCallback((acceptedFiles: File[]) => {
        setNewFiles((prevFiles) => [
            ...prevFiles,
            ...acceptedFiles.map((file) =>
                Object.assign(file, {
                    preview: URL.createObjectURL(file),
                }),
            ),
        ]);
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

    // Clean up preview URLs for new files
    useEffect(() => {
        return () => newFiles.forEach((file) => URL.revokeObjectURL(file.preview));
    }, [newFiles]);

    // Fetch categories and sizes on mount
    const fetchCategories = useCallback(async () => {
        setInternalIsLoading(true);
        try {
            const fetchedCategories = await categoryService.getAllCategories();
            setCategories(fetchedCategories);
            // If editing and initial category exists, set it now that categories are loaded
            if (isEditMode && initialData?.category) {
                const initialCat = fetchedCategories.find((cat) => cat.id === initialData.category?.id);
                if (initialCat && !selectedCategory) {
                    // Set only if not already set
                    setSelectedCategory(initialCat);
                    setCategorySearchTerm(initialCat.name);
                }
            }
            return fetchedCategories;
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            setInternalApiError('Failed to load categories.');
            return [];
        } finally {
            // Only set loading false if not externally controlled
            if (!externalLoading) setInternalIsLoading(false);
        }
    }, [isEditMode, initialData, selectedCategory, externalLoading]); // Add dependencies

    const fetchSizes = useCallback(async () => {
        setInternalIsLoading(true);
        try {
            const fetchedSizes = await sizeService.getAllSizes();
            setSizes(fetchedSizes);
        } catch (error) {
            console.error('Failed to fetch sizes:', error);
            setInternalApiError('Failed to load sizes.');
        } finally {
            if (!externalLoading) setInternalIsLoading(false);
        }
    }, [externalLoading]);

    useEffect(() => {
        fetchCategories();
        fetchSizes();
    }, [fetchCategories, fetchSizes]);

    // --- Event Handlers ---

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setInternalApiError(null);
        setInternalIsLoading(true);

        const formData = {
            name: name,
            description,
            price: price, // Keep as string for validation
            stock: stock, // Keep as string for validation
            categoryId: selectedCategory?.id || '',
            sizeId: selectedSizeId || undefined,
        };

        const validationResult = ProductFormSchema.safeParse(formData);

        if (!validationResult.success) {
            const fieldErrors: Partial<Record<keyof ProductFormData, string>> = {};
            validationResult.error.errors.forEach((err) => {
                if (err.path[0]) {
                    fieldErrors[err.path[0] as keyof ProductFormData] = err.message;
                }
            });
            setErrors(fieldErrors);
            setInternalIsLoading(false);
            return;
        }

        // Prepare payload for API
        const apiPayload: CreateProductPayload | UpdateProductPayload = {
            ...validationResult.data,
            // Ensure description is included even if empty, or handle as needed by API
            description: description || undefined, // Send undefined if empty, adjust if API expects null or ''
        };

        try {
            if (isEditMode && initialData) {
                // Update Product
                // Filter out fields that haven't changed? Or send all validated data.
                // API service should handle partial updates correctly.
                await productService.updateProduct(initialData.id, apiPayload, newFiles);
                // Optionally clear newFiles state after successful upload
                setNewFiles([]);
                alert('Product updated successfully!'); // Replace with better notification
            } else {
                // Create Product
                await productService.createProduct(apiPayload as CreateProductPayload, newFiles);
                // Optionally clear form state after successful creation
                setName('');
                setDescription('');
                setPrice('');
                setStock('');
                setSelectedCategory(null);
                setCategorySearchTerm('');
                setSelectedSizeId('');
                setNewFiles([]);
                setExistingImages([]); // Should be empty anyway in create mode
                alert('Product created successfully!'); // Replace with better notification
            }
            // Call success callback if provided
            onSubmitSuccess?.();
            // Redirect to products list page after success
            router.push('/products');
        } catch (error) {
            console.error(`Product ${isEditMode ? 'update' : 'creation'} failed:`, error);
            setInternalApiError(error instanceof Error ? error.message : `An unexpected error occurred during product ${isEditMode ? 'update' : 'creation'}.`);
        } finally {
            setInternalIsLoading(false);
        }
    };

    // Function to remove a NEW file before upload
    const removeNewFile = (fileName: string) => {
        setNewFiles((prevFiles) => {
            const newFiles = prevFiles.filter((file) => file.name !== fileName);
            const removedFile = prevFiles.find((file) => file.name === fileName);
            if (removedFile) {
                URL.revokeObjectURL(removedFile.preview);
            }
            return newFiles;
        });
    };

    // Function to remove an EXISTING image (calls API)
    const removeExistingImage = async (imageId: string) => {
        if (!initialData) return; // Should not happen if called correctly
        setInternalIsLoading(true);
        setInternalApiError(null);
        try {
            // Call API to delete the image
            const updatedProduct = await productService.deleteProductImage(initialData.id, imageId);
            // Update local state with the remaining images from the response
            setExistingImages(updatedProduct.images || []);
            alert('Image deleted successfully.'); // Replace with better notification
        } catch (error) {
            console.error('Failed to delete image:', error);
            setInternalApiError(error instanceof Error ? error.message : 'Failed to delete image.');
        } finally {
            setInternalIsLoading(false);
        }
    };

    // Handle category selection
    const handleCategorySelect = (category: Category) => {
        setSelectedCategory(category);
        setCategorySearchTerm(category.name);
        setErrors((prev) => ({ ...prev, categoryId: undefined }));
    };

    // Handler to open the create category modal
    const handleOpenCreateCategoryModal = () => {
        setIsCreateCategoryModalOpen(true);
    };

    // Handler for when a new category is successfully created
    const handleCategoryCreated = async (newCategory: Category) => {
        setIsCreateCategoryModalOpen(false);
        const updatedCategories = await fetchCategories(); // Refetch
        const newlyCreated = updatedCategories.find((cat) => cat.id === newCategory.id);
        if (newlyCreated) {
            setSelectedCategory(newlyCreated);
            setCategorySearchTerm(newlyCreated.name);
            setErrors((prev) => ({ ...prev, categoryId: undefined }));
        }
    };

    // --- Render Logic ---

    const pageTitle = isEditMode ? 'Edit Product' : 'Create Product';
    const submitButtonText = isEditMode ? (isLoading ? 'Saving...' : 'Save Changes') : isLoading ? 'Creating...' : 'Create Product';

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-8 text-gray-900 dark:text-gray-100">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold">{pageTitle}</h1>
                    <div>
                        <Button type="button" onClick={() => router.back()} variant="secondary" className="mr-2">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-orange-500 hover:bg-orange-600 text-white">
                            {submitButtonText}
                        </Button>
                    </div>
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
                        <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl shadow border border-zinc-700">
                            {/* Product Name input */}
                            <div>
                                <label htmlFor="productName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Product Name
                                </label>
                                <input
                                    id="productName"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Product Name"
                                    required
                                    className={`block w-full px-3 py-2 mt-1 text-gray-900 bg-white dark:bg-gray-700 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm appearance-none sm:text-sm`}
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                            </div>
                            {/* Description textarea */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 my-2">
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

                            {/* Images Section */}
                            <h2 className="text-lg font-medium mt-6 mb-2">Images</h2>

                            {/* Existing Images (Edit Mode) */}
                            {isEditMode && existingImages.length > 0 && (
                                <div className="mb-4 space-y-2">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Current images:</h3>
                                    <ul className="grid grid-cols-3 gap-2 pt-2">
                                        {existingImages.map((image) => (
                                            <li key={image.id} className="relative aspect-square border dark:border-zinc-700 rounded overflow-hidden">
                                                <img src={image.url} alt={`Existing product image`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(image.id)}
                                                    disabled={isLoading}
                                                    className="absolute top-1 right-1 p-0.5 bg-red-600 bg-opacity-70 rounded-full text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    aria-label={`Remove image`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Add New Images Dropzone */}
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{isEditMode ? 'Add new images:' : 'Upload images:'}</h3>
                            <div
                                {...getRootProps()}
                                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${isDragActive ? 'border-indigo-500' : 'border-gray-300 dark:border-zinc-700'} border-dashed rounded-md cursor-pointer`}
                            >
                                <input {...getInputProps()} />
                                <div className="space-y-1 text-center">
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
                                                    Drag 'n' drop files here, or <span className="text-blue-500 dark:text-blue-400">click to select</span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                </div>
                            </div>

                            {/* New File Previews */}
                            {newFiles.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">New files to upload:</h3>
                                    <ul className="grid grid-cols-3 gap-2 pt-2">
                                        {newFiles.map((file) => (
                                            <li key={file.name} className="relative aspect-square border dark:border-zinc-700 rounded overflow-hidden">
                                                <img src={file.preview} alt={`Preview of ${file.name}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewFile(file.name)}
                                                    className="absolute top-1 right-1 p-0.5 bg-red-600 bg-opacity-70 rounded-full text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                                    aria-label={`Remove ${file.name}`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>{' '}
                        {/* End Product Section Div */}
                        {/* Pricing Section */}
                        <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl shadow border border-zinc-700">
                            <h2 className="text-lg font-medium mb-4">Pricing & Stock</h2>
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
                                        placeholder="eg. 30"
                                        step="0.01"
                                        required
                                        className={`block w-full px-3 py-2 mt-1 text-gray-900 bg-white dark:bg-gray-700 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border ${errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm appearance-none sm:text-sm`}
                                    />
                                    {errors.price && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.price}</p>}
                                </div>
                                {/* Stock input */}
                                <div>
                                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Stock (units)
                                    </label>
                                    <input
                                        id="stock"
                                        type="number"
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                        placeholder="eg. 100"
                                        step="1"
                                        required
                                        className={`block w-full px-3 py-2 mt-1 text-gray-900 bg-white dark:bg-gray-700 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border ${errors.stock ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm appearance-none sm:text-sm`}
                                    />
                                    {errors.stock && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.stock}</p>}
                                </div>
                            </div>
                        </div>{' '}
                        {/* End Pricing Section Div */}
                    </div>{' '}
                    {/* End Left Column Div */}
                    {/* Right Column (Organization) */}
                    <div className="space-y-6">
                        {/* Category Section */}
                        <CategorySelector
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onSelectCategory={handleCategorySelect}
                            searchTerm={categorySearchTerm}
                            onSearchTermChange={setCategorySearchTerm}
                            onCreateNewCategory={handleOpenCreateCategoryModal}
                            error={errors.categoryId}
                            disabled={isLoading}
                        />

                        {/* Size Section */}
                        <SizeSelector sizes={sizes} selectedSizeId={selectedSizeId} onChange={setSelectedSizeId} error={errors.sizeId} disabled={isLoading} />
                    </div>{' '}
                    {/* End Right Column Div */}
                </div>{' '}
                {/* End Grid Div */}
            </form>

            {/* Create Category Modal */}
            <CreateCategoryModal isOpen={isCreateCategoryModalOpen} onClose={() => setIsCreateCategoryModalOpen(false)} onCategoryCreated={handleCategoryCreated} />
        </>
    );
}
