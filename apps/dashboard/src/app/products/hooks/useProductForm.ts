'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useDropzone } from 'react-dropzone';
import { categoryService, Category } from '@/services/category.service';
import { sizeService, Size } from '@/services/size.service';
import { Product, CreateProductPayload, UpdateProductPayload, productService, ProductImage } from '@/services/product.service';

// Define Zod schema (can be kept here or moved to a shared types file)
const ProductFormSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    description: z.string().optional(),
    price: z.preprocess((val) => parseFloat(String(val)), z.number().positive('Price must be positive')),
    stock: z.preprocess((val) => parseInt(String(val), 10), z.number().int().min(0, 'Stock cannot be negative')),
    categoryId: z.string().optional(),
    sizeId: z.string().optional(),
});

type ProductFormData = z.infer<typeof ProductFormSchema>;
type FileWithPreview = File & { preview: string };

interface UseProductFormProps {
    initialData?: Product | null;
    isLoading?: boolean;
    apiError?: string | null;
    onSubmitSuccess?: () => void;
}

export function useProductForm({ initialData = null, isLoading: externalLoading = false, apiError: externalError = null, onSubmitSuccess }: UseProductFormProps) {
    const router = useRouter();
    const isEditMode = !!initialData;

    // State for form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [newFiles, setNewFiles] = useState<FileWithPreview[]>([]);
    const [existingImages, setExistingImages] = useState<ProductImage[]>([]);

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
            setPrice(String(initialData.price) || '');
            setStock(String(initialData.stock) || '');
            setExistingImages(initialData.images || []);

            if (initialData.category) {
                if (categories.length > 0) {
                    const initialCat = categories.find((cat) => cat.id === initialData.category?.id);
                    if (initialCat) {
                        setSelectedCategory(initialCat);
                        setCategorySearchTerm(initialCat.name);
                    }
                } // Else: will be handled by fetchCategories effect
            } else {
                setSelectedCategory(null);
                setCategorySearchTerm('');
            }
            setSelectedSizeId(initialData.size?.id || '');
        }
        // Reset form for create mode or if initialData becomes null
        if (!isEditMode) {
            setName('');
            setDescription('');
            setPrice('');
            setStock('');
            setNewFiles([]);
            setExistingImages([]);
            setSelectedCategory(null);
            setCategorySearchTerm('');
            setSelectedSizeId('');
            setErrors({});
            setInternalApiError(null);
        }
    }, [initialData, isEditMode, categories]);

    // Dropzone configuration
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

    // Clean up preview URLs
    useEffect(() => {
        return () => newFiles.forEach((file) => URL.revokeObjectURL(file.preview));
    }, [newFiles]);

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        // Avoid setting internal loading if external loading is active
        if (!externalLoading) setInternalIsLoading(true);
        setInternalApiError(null); // Clear previous errors
        try {
            const fetchedCategories = await categoryService.getAllCategories();
            setCategories(fetchedCategories);
            // If editing and initial category exists, set it now
            if (isEditMode && initialData?.category) {
                const initialCat = fetchedCategories.find((cat) => cat.id === initialData.category?.id);
                if (initialCat && !selectedCategory) {
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
            if (!externalLoading) setInternalIsLoading(false);
        }
    }, [isEditMode, initialData, selectedCategory, externalLoading]);

    // Fetch sizes
    const fetchSizes = useCallback(async () => {
        if (!externalLoading) setInternalIsLoading(true);
        setInternalApiError(null);
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
    }, [fetchCategories, fetchSizes]); // Run once on mount

    // --- Event Handlers ---

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setInternalApiError(null);
        setInternalIsLoading(true);

        const formData = {
            name: name,
            description,
            price: price,
            stock: stock,
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

        const apiPayload: CreateProductPayload | UpdateProductPayload = {
            ...validationResult.data,
            description: description || undefined,
        };

        try {
            if (isEditMode && initialData) {
                await productService.updateProduct(initialData.id, apiPayload);
                setNewFiles([]); // Clear new files after successful update
                alert('Product updated successfully!');
            } else {
                await productService.createProduct(apiPayload as CreateProductPayload, newFiles);
                // Reset form state after successful creation
                setName('');
                setDescription('');
                setPrice('');
                setStock('');
                setSelectedCategory(null);
                setCategorySearchTerm('');
                setSelectedSizeId('');
                setNewFiles([]);
                setExistingImages([]);
                setErrors({});
                alert('Product created successfully!');
            }
            onSubmitSuccess?.();
            router.push('/products');
        } catch (error) {
            console.error(`Product ${isEditMode ? 'update' : 'creation'} failed:`, error);
            setInternalApiError(error instanceof Error ? error.message : `An unexpected error occurred during product ${isEditMode ? 'update' : 'creation'}.`);
        } finally {
            setInternalIsLoading(false);
        }
    };

    const removeNewFile = (fileName: string) => {
        setNewFiles((prevFiles) => {
            const fileToRemove = prevFiles.find((file) => file.name === fileName);
            if (fileToRemove) {
                URL.revokeObjectURL(fileToRemove.preview);
            }
            return prevFiles.filter((file) => file.name !== fileName);
        });
    };

    const removeExistingImage = async (imageId: string) => {
        if (!initialData) return;
        setInternalIsLoading(true);
        setInternalApiError(null);
        try {
            const updatedProduct = await productService.deleteProductImage(initialData.id, imageId);
            setExistingImages(updatedProduct.images || []);
            alert('Image deleted successfully.');
        } catch (error) {
            console.error('Failed to delete image:', error);
            setInternalApiError(error instanceof Error ? error.message : 'Failed to delete image.');
        } finally {
            setInternalIsLoading(false);
        }
    };

    const handleCategorySelect = (category: Category) => {
        setSelectedCategory(category);
        setCategorySearchTerm(category.name);
        setErrors((prev) => ({ ...prev, categoryId: undefined }));
    };

    const handleOpenCreateCategoryModal = () => {
        setIsCreateCategoryModalOpen(true);
    };

    const handleCategoryCreated = async (newCategory: Category) => {
        setIsCreateCategoryModalOpen(false);
        const updatedCategories = await fetchCategories(); // Refetch and update state
        const newlyCreated = updatedCategories.find((cat) => cat.id === newCategory.id);
        if (newlyCreated) {
            setSelectedCategory(newlyCreated);
            setCategorySearchTerm(newlyCreated.name);
            setErrors((prev) => ({ ...prev, categoryId: undefined }));
        }
    };

    return {
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
        isLoading,
        apiError,
        errors,
        // Actions
        handleSubmit,
        router, // Expose router if needed for cancel button etc.
    };
}
