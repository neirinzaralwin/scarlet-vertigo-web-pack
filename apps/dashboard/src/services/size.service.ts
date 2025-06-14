import { z } from 'zod';
import { apiService } from './api.service';

// Schema for a single size object
const SizeSchema = z.object({
    id: z.string(),
    name: z.string(),
});

// Schema for the API response (array of sizes)
const GetAllSizesResponseSchema = z.array(SizeSchema);

// Type for a single size
export type Size = z.infer<typeof SizeSchema>;

// Type for the API response
export type GetAllSizesResponse = z.infer<typeof GetAllSizesResponseSchema>;

export const sizeService = {
    async getAllSizes(): Promise<GetAllSizesResponse> {
        try {
            const data = await apiService.get<GetAllSizesResponse>('/sizes', {
                requiresAuth: false, // Sizes are public
            });

            // Validate the data against the schema
            const validatedData = GetAllSizesResponseSchema.parse(data);
            return validatedData;
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error('Validation failed:', error.errors);
                throw new Error('Received invalid size data from server.');
            } else {
                console.error('Error fetching sizes:', error);
                throw new Error('Failed to fetch sizes.');
            }
        }
    },
};
