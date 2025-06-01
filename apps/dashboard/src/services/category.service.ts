import { z } from 'zod';
import { apiService } from './api.service';

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
        try {
            const data = await apiService.get<GetAllCategoriesResponse>('/categories', {
                requiresAuth: false, // Categories are public
            });

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

    async createCategory(name: string): Promise<CreateCategoryResponse> {
        try {
            const data = await apiService.post<CreateCategoryResponse>('/categories', { name });
            const validatedData = CreateCategoryResponseSchema.parse(data);
            return validatedData;
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error('Validation failed for create category response:', error.errors);
                throw new Error('Received invalid data after creating category.');
            } else {
                console.error('Error creating category:', error);
                throw error instanceof Error ? error : new Error('An unexpected error occurred while creating the category.');
            }
        }
    },

    async deleteCategory(id: string): Promise<void> {
        try {
            await apiService.delete(`/categories/${id}`);
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error instanceof Error ? error : new Error('An unexpected error occurred while deleting the category.');
        }
    },
};
