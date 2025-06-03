import { GetProductsResponse, GetProductsSchema } from '@/validation/schemas/product.schemas';
import { apiService } from './api-service';
import { validateData } from '@/validation';
import { API_CONST } from '@/constants/api-const';

export const productService = {
    getProducts: async (): Promise<GetProductsResponse> => {
        try {
            const data = await apiService.get<GetProductsResponse>(API_CONST.PRODUCTS, {
                requiresAuth: false,
            });
            return validateData(GetProductsSchema, data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            throw error;
        }
    },
};
