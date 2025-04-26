// filepath: /Users/neirinzaralwin/Developer/randev/projects/scarlet-vertigo-admin/apps/dashboard/src/app/products/components/ProductForm.tsx
'use client';

import React from 'react';
import Button from '@/components/Button'; // Keep this path
import CategorySelector from '@/app/products/create/components/CategorySelector'; // Adjust path if needed
import SizeSelector from '@/app/products/create/components/SizeSelector'; // Adjust path if needed
import CreateCategoryModal from '@/app/categories/components/CreateCategoryModal'; // Adjust path if needed
import { Product, ProductImage } from '@/services/product.service'; // Import only necessary types
import { useProductForm } from '@/app/products/hooks/useProductForm'; // Import the custom hook

interface ProductFormProps {
    initialData?: Product | null;
    isLoading?: boolean; // Prop for external loading state (e.g., page loading)
    apiError?: string | null; // Prop for external API errors (e.g., page loading errors)
    onSubmitSuccess?: () => void;
}

export default function ProductForm({ initialData = null, isLoading: externalLoading = false, apiError: externalError = null, onSubmitSuccess }: ProductFormProps) {
    const {
        // Form State
        name,
        setName,
        description,
        setDescription,
        price,
        setPrice,
        stock,
        setStock,
        newFiles,
        existingImages,
        // Category State & Handlers
        categories,
        selectedCategory,
        handleCategorySelect,
        categorySearchTerm,
        setCategorySearchTerm,
        handleOpenCreateCategoryModal,
        handleCategoryCreated,
        isCreateCategoryModalOpen,
        setIsCreateCategoryModalOpen,
        // Size State & Handlers
        sizes,
        selectedSizeId,
        setSelectedSizeId,
        // Dropzone
        getRootProps,
        getInputProps,
        isDragActive,
        removeNewFile,
        removeExistingImage,
        // Form Status
        isEditMode,
        isLoading, // Use the combined loading state from the hook
        apiError, // Use the combined apiError state from the hook
        errors,
        // Actions
        handleSubmit,
        router,
    } = useProductForm({
        initialData,
        isLoading: externalLoading,
        apiError: externalError,
        onSubmitSuccess,
    });

    const pageTitle = isEditMode ? 'Edit Product' : 'Create Product';
    const submitButtonText = isEditMode ? (isLoading ? 'Saving...' : 'Save Changes') : isLoading ? 'Creating...' : 'Create Product';

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-8 text-gray-900 dark:text-gray-100">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold">{pageTitle}</h1>
                    <div className="flex items-center">
                        {isEditMode && (
                            <Button type="button" onClick={() => router.back()} variant="secondary" className="mr-2">
                                Cancel
                            </Button>
                        )}
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
                                    rows={8}
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
                                    <ul className="grid grid-cols-6 gap-2 pt-2">
                                        {existingImages.map((image: ProductImage) => (
                                            <li key={image.id} className="relative aspect-square border dark:border-zinc-700 rounded overflow-hidden">
                                                <img src={image.url} alt={`Existing product image ${image.id}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(image.id)}
                                                    disabled={isLoading}
                                                    className="absolute top-1 right-1 p-0.5 bg-zinc-500 bg-opacity-70 rounded-full text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                    className="absolute top-1 right-1 p-0.5 bg-zinc-500 bg-opacity-70 rounded-full text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
                        <SizeSelector
                            sizes={sizes}
                            selectedSizeId={selectedSizeId}
                            onChange={setSelectedSizeId} // Correct prop name
                            error={errors.sizeId}
                            disabled={isLoading}
                        />
                    </div>{' '}
                    {/* End Right Column Div */}
                </div>{' '}
                {/* End Grid Div */}
            </form>

            {/* Create Category Modal */}
            <CreateCategoryModal isOpen={isCreateCategoryModalOpen} onClose={() => setIsCreateCategoryModalOpen(false)} onCategoryCreated={handleCategoryCreated} />
        </> // Add closing fragment tag
    );
}
