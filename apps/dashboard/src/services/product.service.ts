import { z } from 'zod';
import { apiService } from './api.service';

// Product schema
const ProductSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.string(), // API returns price as string
    stock: z.number(),
    images: z.array(z.any()).optional(),
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
    createdAt: z.string(),
    updatedAt: z.string(),
});

// DTOs
const CreateProductSchema = z.object({
    name: z.string(),
    description: z.string(),
    price: z.number(),
    stock: z.number(),
    categoryId: z.string().optional(),
    sizeId: z.string(),
});

const UpdateProductSchema = CreateProductSchema.partial();

const GetProductsResponseSchema = z.object({
    products: z.array(ProductSchema),
    total: z.number(),
});

// Types
export type Product = z.infer<typeof ProductSchema>;
export type CreateProductDto = z.infer<typeof CreateProductSchema>;
export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;
export type GetProductsResponse = z.infer<typeof GetProductsResponseSchema>;

export interface GetProductsParams {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    sizeId?: string;
}

export const productService = {
    async getProducts(params?: GetProductsParams): Promise<GetProductsResponse> {
        try {
            const queryParams = new URLSearchParams();

            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());
            if (params?.search) queryParams.append('search', params.search);
            if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
            if (params?.sizeId) queryParams.append('sizeId', params.sizeId);

            const endpoint = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

            const data = await apiService.get<GetProductsResponse>(endpoint, {
                requiresAuth: false, // Products are public
            });

            const validatedData = GetProductsResponseSchema.parse(data);
            return validatedData;
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error('Validation failed:', error.errors);
                throw new Error('Received invalid product data from server.');
            }
            console.error('Error fetching products:', error);
            throw new Error('Failed to fetch products.');
        }
    },

    async getProduct(id: string): Promise<Product> {
        try {
            const data = await apiService.get<Product>(`/products/${id}`, {
                requiresAuth: false, // Individual products are public
            });

            const validatedData = ProductSchema.parse(data);
            return validatedData;
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error('Validation failed:', error.errors);
                throw new Error('Received invalid product data from server.');
            }
            console.error('Error fetching product:', error);
            throw new Error('Failed to fetch product.');
        }
    },

    async createProduct(productData: CreateProductDto, files?: FileList): Promise<Product> {
        try {
            CreateProductSchema.parse(productData);

            if (files && files.length > 0) {
                // Create FormData for file upload
                const formData = new FormData();

                // Add product data
                Object.entries(productData).forEach(([key, value]) => {
                    if (value !== undefined) {
                        formData.append(key, value.toString());
                    }
                });

                // Add files
                Array.from(files).forEach((file) => {
                    formData.append('files', file);
                });

                const data = await apiService.uploadFiles<Product>('/products', formData);
                const validatedData = ProductSchema.parse(data);
                return validatedData;
            } else {
                // Create product without files
                const data = await apiService.post<Product>('/products', productData);
                const validatedData = ProductSchema.parse(data);
                return validatedData;
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error('Validation failed:', error.errors);
                throw new Error('Invalid product data provided.');
            }
            console.error('Error creating product:', error);
            throw error instanceof Error ? error : new Error('Failed to create product.');
        }
    },

    async updateProduct(id: string, productData: UpdateProductDto): Promise<{ message: string; product: Product }> {
        try {
            UpdateProductSchema.parse(productData);

            const data = await apiService.put<{ message: string; product: Product }>(`/products/${id}`, productData);
            return data;
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error('Validation failed:', error.errors);
                throw new Error('Invalid product data provided.');
            }
            console.error('Error updating product:', error);
            throw error instanceof Error ? error : new Error('Failed to update product.');
        }
    },

    async deleteProduct(id: string): Promise<{ message: string }> {
        try {
            const data = await apiService.delete<{ message: string }>(`/products/${id}`);
            return data;
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error instanceof Error ? error : new Error('Failed to delete product.');
        }
    },

    async uploadProductImages(id: string, files: FileList): Promise<{ message: string }> {
        try {
            const formData = new FormData();
            Array.from(files).forEach((file) => {
                formData.append('files', file);
            });

            const data = await apiService.uploadFiles<{ message: string }>(`/products/${id}/images`, formData);
            return data;
        } catch (error) {
            console.error('Error uploading product images:', error);
            throw error instanceof Error ? error : new Error('Failed to upload product images.');
        }
    },

    async deleteProductImage(productId: string, imageId: string): Promise<{ message: string; product: Product }> {
        try {
            const data = await apiService.delete<{ message: string; product: Product }>(`/products/${productId}/images/${imageId}`);
            return data;
        } catch (error) {
            console.error('Error deleting product image:', error);
            throw error instanceof Error ? error : new Error('Failed to delete product image.');
        }
    },
};
