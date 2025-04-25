import { getAuthCookie } from '@/utils/authCookies';
import { z } from 'zod';

const CategorySchema = z.object({
    id: z.string(),
    name: z.string(),
});

// Assume the API returns an array of categories directly
const GetAllCategoriesResponseSchema = z.array(CategorySchema);

export type Category = z.infer<typeof CategorySchema>;

// Update the response type alias accordingly
export type GetAllCategoriesResponse = z.infer<typeof GetAllCategoriesResponseSchema>;

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
};
