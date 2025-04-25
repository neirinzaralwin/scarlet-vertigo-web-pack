import { getAuthCookie } from '@/utils/authCookies';
import { z } from 'zod';

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
        const token = getAuthCookie(); // Although public, include token if available for consistency
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sizes`, {
                method: 'GET',
                headers: headers,
            });

            if (!response.ok) {
                console.error('Failed to fetch sizes:', response.statusText);
                throw new Error('Failed to fetch sizes');
            }

            const data = await response.json();

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
