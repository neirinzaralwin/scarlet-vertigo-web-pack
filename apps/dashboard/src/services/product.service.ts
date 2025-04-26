import { getAuthCookie } from '@/utils/authCookies';
import { z } from 'zod'; // Import zod
import { Category } from './category.service'; // Assuming Category type is needed
import { Size } from './size.service'; // Assuming Size type is needed

// Define Zod schema for a single product (adjust based on actual API response for single product)
const ProductSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional().nullable(), // Make optional/nullable if API allows
    // Use preprocess to convert string price to number before validation
    price: z.preprocess((val) => parseFloat(String(val)), z.number()),
    stock: z.number().int(), // Ensure stock is an integer
    // Assuming images is an array of objects with url and id
    images: z
        .array(z.object({ id: z.string(), url: z.string() }))
        .optional()
        .default([]),
    // Adjust category/size based on how they are returned (ID string or object)
    category: z.object({ id: z.string(), name: z.string() }).nullable(),
    size: z.object({ id: z.string(), name: z.string() }).nullable(),
    createdAt: z.string().datetime(), // Validate as ISO datetime string
    updatedAt: z.string().datetime(), // Validate as ISO datetime string
});

// Define Zod schema for the API response for Get All Products
const GetProductsResponseSchema = z.object({
    // Use a simplified Product schema for the list if needed, or the full one
    products: z.array(ProductSchema),
    total: z.number(),
});

// Infer the Product type from the Zod schema
export type Product = z.infer<typeof ProductSchema>;

// Infer the response type for Get All
export type GetProductsResponse = z.infer<typeof GetProductsResponseSchema>;

// Define Zod schema for Create Product Payload (adjust based on API expectation)
// Note: Files are handled separately via FormData
const CreateProductPayloadSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().positive(),
    stock: z.number().int().min(0),
    categoryId: z.string().optional(), // Make categoryId optional
    sizeId: z.string().optional(),
});
export type CreateProductPayload = z.infer<typeof CreateProductPayloadSchema>;

// Define Zod schema for Update Product Payload (adjust based on API expectation)
const UpdateProductPayloadSchema = CreateProductPayloadSchema.partial(); // Allow partial updates
export type UpdateProductPayload = z.infer<typeof UpdateProductPayloadSchema>;

// Helper function to get headers
const getHeaders = () => {
    const token = getAuthCookie();
    const headers: HeadersInit = {
        // Content-Type is often set automatically by fetch for FormData
        // 'Content-Type': 'application/json', // Remove this for FormData
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

// Helper function to handle API errors
const handleApiError = async (response: Response, defaultMessage: string) => {
    if (!response.ok) {
        let errorMessage = defaultMessage;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || JSON.stringify(errorData);
        } catch (e) {
            // Ignore if response is not JSON
        }
        console.error(`${defaultMessage}: ${response.status} ${response.statusText}`, errorMessage);
        throw new Error(errorMessage);
    }
    return response.json();
};

export const productService = {
    async getProducts(): Promise<GetProductsResponse> {
        const headers = getHeaders();
        // Ensure Content-Type is set for GET requests if needed by backend, but usually not
        headers['Content-Type'] = 'application/json';

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
                method: 'GET',
                headers: headers,
            });

            const data = await handleApiError(response, 'Failed to fetch products');

            // Validate the data using the Zod schema
            const validatedData = GetProductsResponseSchema.parse(data);

            // Return the validated data
            return validatedData;
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error('Validation failed:', error.errors);
                throw new Error('Received invalid product list data from server.');
            } else {
                // Re-throw the error from handleApiError or a generic one
                throw error instanceof Error ? error : new Error('An unexpected error occurred while fetching products.');
            }
        }
    },

    async getProductById(id: string): Promise<Product> {
        const headers = getHeaders();
        headers['Content-Type'] = 'application/json'; // Needed for GET with query param? Check backend.

        try {
            // Assuming backend uses path param /products/:id
            // If backend uses query param /products?id=..., change URL accordingly
            // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?id=${id}`, {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
                method: 'GET',
                headers: headers,
            });

            const data = await handleApiError(response, `Failed to fetch product with ID ${id}`);

            // Validate the data using the Zod schema
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
        const headers = getHeaders(); // Content-Type will be set by FormData

        const formData = new FormData();
        formData.append('name', payload.name);
        if (payload.description) formData.append('description', payload.description);
        formData.append('price', String(payload.price));
        formData.append('stock', String(payload.stock));
        // Only append categoryId if it exists
        if (payload.categoryId) {
            formData.append('categoryId', payload.categoryId);
        }
        if (payload.sizeId) formData.append('sizeId', payload.sizeId);
        files.forEach((file) => formData.append('files', file)); // Use 'files' as key expected by backend

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
                method: 'POST',
                headers: headers,
                body: formData,
            });

            const data = await handleApiError(response, 'Failed to create product');
            // Assuming the API returns the created product, validate it
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

    async updateProduct(id: string, payload: UpdateProductPayload, files?: File[]): Promise<Product> {
        const headers = getHeaders(); // Content-Type will be set by FormData if files exist

        const formData = new FormData();
        // Append only fields that are present in the payload
        Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                // Special handling for potentially optional fields if needed
                if (key === 'price' || key === 'stock') {
                    formData.append(key, String(value));
                } else {
                    formData.append(key, value as string); // Assume other values are strings or compatible
                }
            }
        });

        if (files && files.length > 0) {
            files.forEach((file) => formData.append('files', file)); // Use 'files' if backend expects this for updates too
        } else if (Object.keys(payload).length > 0 && (!files || files.length === 0)) {
            // If only updating metadata (no files), set Content-Type to json
            headers['Content-Type'] = 'application/json';
        }

        try {
            // Assuming backend uses path param /products/:id for PUT
            // If backend uses query param /products?id=..., change URL accordingly
            // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?id=${id}`, {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
                method: 'PUT',
                headers: headers,
                // Send FormData if files exist or if backend expects FormData even for metadata updates
                // Send JSON stringified payload only if no files and backend expects JSON
                body: (files && files.length > 0) || !(headers['Content-Type'] === 'application/json') ? formData : JSON.stringify(payload),
            });

            const data = await handleApiError(response, `Failed to update product with ID ${id}`);
            // Assuming the API returns the updated product, validate it
            const validatedData = ProductSchema.parse(data);
            return validatedData;
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error('Validation failed:', error.errors);
                throw new Error('Received invalid product data after update.');
            } else {
                throw error instanceof Error ? error : new Error(`An unexpected error occurred while updating product ${id}.`);
            }
        }
    },

    async deleteProduct(id: string): Promise<{ message: string }> {
        const headers = getHeaders();
        headers['Content-Type'] = 'application/json';

        try {
            // Assuming backend uses path param /products/:id for DELETE
            // If backend uses query param /products?id=..., change URL accordingly
            // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?id=${id}`, {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
                method: 'DELETE',
                headers: headers,
            });

            // Check for 200 or 204 No Content for successful deletion
            if (!response.ok && response.status !== 204) {
                await handleApiError(response, `Failed to delete product with ID ${id}`); // Will throw error
            }

            // Return a success message or handle potential JSON response if API sends one
            try {
                return await response.json();
            } catch (e) {
                return { message: `Product ${id} deleted successfully.` }; // Default success message
            }
        } catch (error) {
            throw error instanceof Error ? error : new Error(`An unexpected error occurred while deleting product ${id}.`);
        }
    },

    async deleteProductImage(productId: string, imageId: string): Promise<Product> {
        const headers = getHeaders();
        headers['Content-Type'] = 'application/json';

        try {
            // Assuming backend uses DELETE /products/:productId/images/:imageId or similar
            // Adjust URL and method based on actual API endpoint
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/images/${imageId}`, {
                // Example URL
                method: 'DELETE', // Or POST/PUT depending on API design
                headers: headers,
                // body: JSON.stringify({ imageId }), // If using body instead of path param for imageId
            });

            const data = await handleApiError(response, `Failed to delete image ${imageId} for product ${productId}`);
            // Assuming API returns the updated product after image deletion
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
