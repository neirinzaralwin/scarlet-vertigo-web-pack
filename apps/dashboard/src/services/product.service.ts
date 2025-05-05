import { getAuthCookie } from '@/utils/authCookies';
import { z } from 'zod';
import { Category } from './category.service';
import { Size } from './size.service';

const createFullImageUrl = (url: string | undefined | null): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    return `${apiUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};

const ProductImageSchema = z.object({
    id: z.string(),
    url: z.string().transform(createFullImageUrl).pipe(z.string().url().optional()),
});

const ProductSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional().nullable(),

    price: z.preprocess((val) => parseFloat(String(val)), z.number()),
    stock: z.number().int(),

    images: z.array(ProductImageSchema).optional().default([]),

    category: z
        .object({
            id: z.string(),
            name: z.string(),
        })
        .nullable()
        .optional(),
    size: z
        .object({
            id: z.string(),
            name: z.string(),
        })
        .nullable()
        .optional(),
    createdAt: z.preprocess((arg) => {
        if (typeof arg == 'string' || arg instanceof Date) return new Date(arg);
    }, z.date()),
    updatedAt: z.preprocess((arg) => {
        if (typeof arg == 'string' || arg instanceof Date) return new Date(arg);
    }, z.date()),
});

const GetProductsResponseSchema = z.object({
    products: z.array(ProductSchema),
    total: z.number(),
});

export type Product = z.infer<typeof ProductSchema>;

export type ProductImage = z.infer<typeof ProductImageSchema>;

export type GetProductsResponse = z.infer<typeof GetProductsResponseSchema>;

const CreateProductPayloadSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().positive(),
    stock: z.number().int().min(0),
    categoryId: z.string().optional(),
    sizeId: z.string().optional(),
});
export type CreateProductPayload = z.infer<typeof CreateProductPayloadSchema>;

const UpdateProductPayloadSchema = CreateProductPayloadSchema.partial();
export type UpdateProductPayload = z.infer<typeof UpdateProductPayloadSchema>;

const getHeaders = () => {
    const token = getAuthCookie();
    const headers: HeadersInit = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const handleApiError = async (response: Response, defaultMessage: string) => {
    if (!response.ok) {
        let errorMessage = defaultMessage;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || JSON.stringify(errorData);
        } catch (e) {}
        console.error(`${defaultMessage}: ${response.status} ${response.statusText}`, errorMessage);
        throw new Error(errorMessage);
    }
    return response.json();
};

export const productService = {
    async getProducts(): Promise<GetProductsResponse> {
        const headers = getHeaders();

        headers['Content-Type'] = 'application/json';

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
                method: 'GET',
                headers: headers,
            });

            const data = await handleApiError(response, 'Failed to fetch products');

            const validatedData = GetProductsResponseSchema.parse(data);

            return validatedData;
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error('Validation failed:', error.errors);
                throw new Error('Received invalid product list data from server.');
            } else {
                throw error instanceof Error ? error : new Error('An unexpected error occurred while fetching products.');
            }
        }
    },

    async getProductById(id: string): Promise<Product> {
        const headers = getHeaders();
        headers['Content-Type'] = 'application/json';

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
                method: 'GET',
                headers: headers,
            });

            const data = await handleApiError(response, `Failed to fetch product with ID ${id}`);

            const validatedData = ProductSchema.parse(data);
            return validatedData;
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error('Validation failed:', error.errors);
                throw new Error('Received invalid product data from server.');
            } else {
                throw error instanceof Error ? error : new Error(`An unexpected error occurred while fetching product ${id}.`);
            }
        }
    },

    async createProduct(payload: CreateProductPayload, files: File[]): Promise<Product> {
        const headers = getHeaders();
        const formData = new FormData();
        formData.append('name', payload.name);
        if (payload.description) formData.append('description', payload.description);
        formData.append('price', String(payload.price));
        formData.append('stock', String(payload.stock));

        if (payload.categoryId) formData.append('categoryId', payload.categoryId);

        if (payload.sizeId) formData.append('sizeId', payload.sizeId);
        files.forEach((file) => formData.append('files', file));

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
                method: 'POST',
                headers: headers,
                body: formData,
            });

            const data = await handleApiError(response, 'Failed to create product');

            const validatedData = ProductSchema.parse(data);
            return validatedData;
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error('Validation failed:', error.errors);
                throw new Error('Received invalid product data after creation.');
            } else {
                throw error instanceof Error ? error : new Error('An unexpected error occurred during product creation.');
            }
        }
    },

    async updateProduct(id: string, payload: UpdateProductPayload): Promise<Product> {
        const headers = getHeaders();
        headers['Content-Type'] = 'application/json';

        // Ensure only defined values are sent in the payload
        const updateData: Partial<UpdateProductPayload> = {};
        if (payload.name !== undefined) updateData.name = payload.name;
        if (payload.description !== undefined) updateData.description = payload.description;
        if (payload.price !== undefined) updateData.price = payload.price;
        if (payload.stock !== undefined) updateData.stock = payload.stock;
        if (payload.categoryId !== undefined) updateData.categoryId = payload.categoryId;
        if (payload.sizeId !== undefined) updateData.sizeId = payload.sizeId;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(updateData),
            });
            const data = await handleApiError(response, `Failed to update product with ID ${id}`);
            const validatedData = ProductSchema.parse(data['product']);
            return validatedData;
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error('Validation failed:', error.errors);
                throw new Error('Received invalid product data after update.');
            } else {
                throw error instanceof Error ? error : new Error(`An unexpected error occurred during product update for ID ${id}.`);
            }
        }
    },

    async deleteProduct(id: string): Promise<{ message: string }> {
        const headers = getHeaders();
        headers['Content-Type'] = 'application/json';

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
                method: 'DELETE',
                headers: headers,
            });

            if (!response.ok && response.status !== 204) {
                await handleApiError(response, `Failed to delete product with ID ${id}`);
            }

            try {
                return await response.json();
            } catch (e) {
                return { message: `Product ${id} deleted successfully.` };
            }
        } catch (error) {
            throw error instanceof Error ? error : new Error(`An unexpected error occurred while deleting product ${id}.`);
        }
    },

    async deleteProductImage(productId: string, imageId: string): Promise<Product> {
        const headers = getHeaders();
        headers['Content-Type'] = 'application/json';

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/images/${imageId}`, {
                method: 'DELETE',
                headers: headers,
            });

            const data = await handleApiError(response, `Failed to delete image ${imageId} for product ${productId}`);

            const validatedData = ProductSchema.parse(data);
            return validatedData;
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error('Validation failed:', error.errors);
                throw new Error('Received invalid product data after image deletion.');
            } else {
                throw error instanceof Error ? error : new Error(`An unexpected error occurred while deleting image ${imageId}.`);
            }
        }
    },
};
