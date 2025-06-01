import { z } from 'zod';

// Product-related validation schemas
export const ProductSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    description: z.string().optional(),
    price: z.number().positive('Price must be positive'),
    categoryId: z.string().min(1, 'Category is required'),
    sizes: z.array(z.string()).min(1, 'At least one size is required'),
    imageUrl: z.string().url('Please enter a valid image URL').optional(),
    isActive: z.boolean().default(true),
});

export const ProductUpdateSchema = ProductSchema.partial();

export const ProductQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    categoryId: z.string().optional(),
    sortBy: z.enum(['name', 'price', 'createdAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Type exports
export type Product = z.infer<typeof ProductSchema>;
export type ProductUpdate = z.infer<typeof ProductUpdateSchema>;
export type ProductQuery = z.infer<typeof ProductQuerySchema>;
