import { z } from 'zod';
import { ApiError } from '@/types/api'; // Import ApiError from the shared types file
import { setAuthCookie } from '@/utils/authCookies'; // Import cookie utility

const LoginResponseSchema = z.object({
    accessToken: z.string(),
});

const LoginCredentialsSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});
type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3031';

export const authService = {
    login: async (credentials: LoginCredentials): Promise<{ token: string }> => {
        LoginCredentialsSchema.parse(credentials);

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorData: ApiError = await response.json();

            const errorMessage =
                typeof errorData.message === 'string' ? errorData.message : Array.isArray(errorData.message) ? errorData.message.join(', ') : 'Login failed. Please check your credentials.';
            throw new Error(errorMessage);
        }

        const data = await response.json();

        const parsedData = LoginResponseSchema.safeParse(data);
        if (!parsedData.success) {
            console.error('Invalid API response structure:', parsedData.error);
            throw new Error('Received invalid data from server.');
        }

        // Store token in cookie instead of returning it directly
        setAuthCookie(parsedData.data.accessToken);

        // Return the token (optional, might not be needed by caller anymore)
        return { token: parsedData.data.accessToken };
    },

    // Add a logout function (optional, can also be handled directly in components)
    logout: () => {
        // In a real app, you might want to call a backend endpoint
        // to invalidate the token on the server side as well.
        console.log('Logging out');
    },
};
