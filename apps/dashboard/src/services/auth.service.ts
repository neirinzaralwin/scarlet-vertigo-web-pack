import { ApiError } from '@/types/api';
import { setAuthCookie } from '@/utils/authCookies';
import { apiService } from './api.service';
import { LoginCredentialsSchema, LoginResponseSchema, type LoginCredentials } from '@/validation/schemas/auth.schemas';
import { validateData } from '@/validation/validator';

export const authService = {
    login: async (credentials: LoginCredentials): Promise<{ token: string }> => {
        try {
            // Validate credentials using the centralized validator
            const validatedCredentials = validateData(LoginCredentialsSchema, credentials);

            // Make API call without auth token (login doesn't require it)
            const data = await apiService.post<{ accessToken: string }>('/auth/login', validatedCredentials, {
                requiresAuth: false,
            });

            // Validate response using the centralized validator
            const validatedResponse = validateData(LoginResponseSchema, data);

            // Store token in cookie
            setAuthCookie(validatedResponse.accessToken);

            // Return the token
            return { token: validatedResponse.accessToken };
        } catch (error) {
            console.error('Login error:', error);

            // Handle validation errors specifically
            if (error instanceof Error && error.name === 'ValidationError') {
                throw new Error('Invalid credentials format.');
            }

            // Re-throw the error (it's already been processed by apiService)
            throw error instanceof Error ? error : new Error('Login failed. Please check your credentials.');
        }
    },

    // Add a logout function (optional, can also be handled directly in components)
    logout: () => {
        // In a real app, you might want to call a backend endpoint
        // to invalidate the token on the server side as well.
        console.log('Logging out');
    },
};
