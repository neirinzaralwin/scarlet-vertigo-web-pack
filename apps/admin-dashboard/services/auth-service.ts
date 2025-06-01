import { setAuthCookie } from '@/utils/auth-cookies';
import { LoginCredentialsSchema, LoginResponseSchema, type LoginCredentials } from '@/validation/schemas/auth.schemas';
import { validateData } from '@/validation/validator';
import { apiService } from './api-service';

export const authService = {
    login: async (credentials: LoginCredentials): Promise<{ token: string }> => {
        try {
            const validatedCredentials = validateData(LoginCredentialsSchema, credentials);

            const data = await apiService.post<{ accessToken: string }>('/auth/login', validatedCredentials, {
                requiresAuth: false,
            });

            const validatedResponse = validateData(LoginResponseSchema, data);

            setAuthCookie(validatedResponse.accessToken);

            return { token: validatedResponse.accessToken };
        } catch (error) {
            console.error('Login error:', error);

            if (error instanceof Error && error.name === 'ValidationError') {
                throw new Error('Invalid credentials format.');
            }

            throw error instanceof Error ? error : new Error('Login failed. Please check your credentials.');
        }
    },

    logout: () => {
        console.log('Logging out');
    },
};
