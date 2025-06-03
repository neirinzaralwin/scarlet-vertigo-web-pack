import { z } from 'zod';
import { CategorySchema } from './category.schemas';
import { SizeSchema } from './size.schema';

export const ProductImageSchema = z.object({
    id: z.string(),
    url: z.string(),
});
export type ProductImage = z.infer<typeof ProductImageSchema>;

export const ProductSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.string(),
    stock: z.number(),
    images: ProductImageSchema.array(),
    createdAt: z.string(),
    updatedAt: z.string(),
    category: CategorySchema.optional(),
    size: SizeSchema.optional(),
});
export type Product = z.infer<typeof ProductSchema>;

export const GetProductsSchema = z.object({
    products: ProductSchema.array(),
    total: z.number(),
});
export type GetProductsResponse = z.infer<typeof GetProductsSchema>;
