// Export all services for easy importing
export { apiService } from './api.service';
export { authService } from './auth.service';
export { categoryService } from './category.service';
export { productService } from './product.service';
export { sizeService } from './size.service';

// Export types
export type { RequestConfig } from './api.service';
export type { Category, GetAllCategoriesResponse, CreateCategoryResponse } from './category.service';
export type { Product, CreateProductDto, UpdateProductDto, GetProductsResponse, GetProductsParams } from './product.service';
export type { Size, GetAllSizesResponse } from './size.service';
