import { getAuthCookie } from '@/utils/authCookies';
import { z } from 'zod'; // Import zod

// Define Zod schema for a single product
const ProductSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    // Use preprocess to convert string price to number before validation
    price: z.preprocess((val) => parseFloat(String(val)), z.number()),
    stock: z.number(),
    images: z.array(z.string()), // Assuming images is an array of strings (URLs)
    category: z.any().nullable(),
    size: z.any().nullable(),
    createdAt: z.string().datetime(), // Validate as ISO datetime string
    updatedAt: z.string().datetime(), // Validate as ISO datetime string
});

// Define Zod schema for the API response
const GetProductsResponseSchema = z.object({
    products: z.array(ProductSchema),
    total: z.number(),
});

// Infer the Product type from the Zod schema
export type Product = z.infer<typeof ProductSchema>;

// Infer the response type
export type GetProductsResponse = z.infer<typeof GetProductsResponseSchema>;

export const productService = {
    async getProducts(): Promise<GetProductsResponse> {
        const token = getAuthCookie();
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
                method: 'GET',
                headers: headers,
            });

            if (!response.ok) {
                console.error('Failed to fetch products:', response.statusText);
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();

            // Validate the data using the Zod schema
            const validatedData = GetProductsResponseSchema.parse(data);

            // Return the validated data
            return validatedData;
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error('Validation failed:', error.errors);
                throw new Error('Received invalid product data from server.');
            } else {
                console.error('Error fetching products:', error);
                throw new Error('Failed to fetch products.'); // Keep generic error for other issues
            }
        }
    },

    // Add other product-related API functions here (e.g., getProductById, createProduct, updateProduct, deleteProduct)
};
