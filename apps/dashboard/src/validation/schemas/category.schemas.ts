import { z } from 'zod';

// Category-related validation schemas
export const CategorySchema = z.object({
    name: z.string().min(1, 'Category name is required').max(50, 'Category name too long'),
    description: z.string().optional(),
    parentId: z.string().optional(),
    isActive: z.boolean().default(true),
});

export const CategoryUpdateSchema = CategorySchema.partial();

export const CategoryQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    parentId: z.string().optional(),
});

// Type exports
export type Category = z.infer<typeof CategorySchema>;
export type CategoryUpdate = z.infer<typeof CategoryUpdateSchema>;
export type CategoryQuery = z.infer<typeof CategoryQuerySchema>;
