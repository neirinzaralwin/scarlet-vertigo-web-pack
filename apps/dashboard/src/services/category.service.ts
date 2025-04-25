import { getAuthCookie } from '@/utils/authCookies';
import { z } from 'zod';

const CategorySchema = z.object({
    id: z.string(),
    name: z.string(),
});

// Assume the API returns an array of categories directly
const GetAllCategoriesResponseSchema = z.array(CategorySchema);
// Schema for the response of creating a category (assuming it returns the created category)
const CreateCategoryResponseSchema = CategorySchema;

export type Category = z.infer<typeof CategorySchema>;

// Update the response type alias accordingly
export type GetAllCategoriesResponse = z.infer<typeof GetAllCategoriesResponseSchema>;
export type CreateCategoryResponse = z.infer<typeof CreateCategoryResponseSchema>;

export const categoryService = {
    async getAllCategories(): Promise<GetAllCategoriesResponse> {
        const token = getAuthCookie();
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
                method: 'GET',
                headers: headers,
            });

            if (!response.ok) {
                console.error('Failed to fetch categories:', response.statusText);
                throw new Error('Failed to fetch categories');
            }

            const data = await response.json();

            // Validate the data as an array of categories
            const validatedData = GetAllCategoriesResponseSchema.parse(data);

            return validatedData;
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error('Validation failed:', error.errors);
                throw new Error('Received invalid category data from server.');
            } else {
                console.error('Error fetching categories:', error);
                throw new Error('Failed to fetch categories.');
            }
        }
    },

    // Add createCategory function
    async createCategory(name: string): Promise<CreateCategoryResponse> {
        const token = getAuthCookie();
        if (!token) {
            throw new Error('Authentication token not found.');
        }
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ name }),
            });

            if (!response.ok) {
                const errorData = await response.text(); // Read error response body
                console.error('Failed to create category:', response.status, errorData);
                throw new Error(`Failed to create category: ${response.statusText} - ${errorData}`);
            }

            const data = await response.json();
            const validatedData = CreateCategoryResponseSchema.parse(data);
            return validatedData;
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error('Validation failed for create category response:', error.errors);
                throw new Error('Received invalid data after creating category.');
            } else {
                console.error('Error creating category:', error);
                // Re-throw the specific error from fetch or a generic one
                throw error instanceof Error ? error : new Error('An unexpected error occurred while creating the category.');
            }
        }
    },

    // Add deleteCategory function
    async deleteCategory(id: string): Promise<void> {
        const token = getAuthCookie();
        if (!token) {
            throw new Error('Authentication token not found.');
        }
        const headers: HeadersInit = {
            Authorization: `Bearer ${token}`,
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`, {
                method: 'DELETE',
                headers: headers,
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Failed to delete category:', response.status, errorData);
                throw new Error(`Failed to delete category: ${response.statusText} - ${errorData}`);
            }

            // No need to parse response body for DELETE if API returns 204 No Content or similar
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error instanceof Error ? error : new Error('An unexpected error occurred while deleting the category.');
        }
    },
};
