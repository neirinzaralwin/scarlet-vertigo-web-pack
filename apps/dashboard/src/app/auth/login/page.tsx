'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { authService } from '@/services/auth.service';
import { useValidation } from '@/hooks/useValidation';
import { LoginCredentialsSchema, type LoginCredentials } from '@/validation/schemas/auth.schemas';

export default function LoginPage() {
    const [formData, setFormData] = useState<Partial<LoginCredentials>>({
        email: '',
        password: '',
    });
    const [apiError, setApiError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const validation = useValidation(LoginCredentialsSchema, {
        validateOnBlur: true,
        validateOnChange: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Only validate if both fields have values
        if (!formData.email?.trim() || !formData.password?.trim()) {
            setApiError('Please fill in all fields');
            return;
        }

        // Validate the entire form using our centralized validation
        const validationResult = validation.validate(formData);

        if (!validationResult.isValid) {
            return; // Stop if validation fails
        }

        setApiError(null);
        setIsLoading(true);

        try {
            if (validationResult.data) {
                const { token } = await authService.login(validationResult.data);
                console.log('Login successful, token received:', token);
                sessionStorage.setItem('token', token);
                router.push('/');
            }
        } catch (error) {
            console.error('Login failed:', error);
            setApiError(error instanceof Error ? error.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFieldChange = (field: keyof LoginCredentials) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Clear field error when user starts typing
        if (validation.errors[field]) {
            validation.clearFieldError(field);
        }

        // Clear API error when user starts typing
        if (apiError) {
            setApiError(null);
        }
    };

    const handleFieldBlur = (field: keyof LoginCredentials) => (e: React.FocusEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Only validate if the field has content
        if (value.trim()) {
            validation.validateField(field, value, formData);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md dark:bg-zinc-900">
                <h2 className="text-lg font-bold text-center text-gray-500 dark:text-gray-500">Randev</h2>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Login</h2>
                {apiError && (
                    <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded dark:bg-red-900 dark:text-red-300 dark:border-red-800" role="alert">
                        {apiError}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={formData.email || ''}
                            onChange={handleFieldChange('email')}
                            onBlur={handleFieldBlur('email')}
                            required
                            placeholder="you@example.com"
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-black dark:focus:ring-zinc-500 focus:border-black dark:focus:border-zinc-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s] [&:-webkit-autofill]:[-webkit-text-fill-color:rgb(17,24,39)] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(243,244,246)] ${
                                validation.errors.email ? 'border-red-300 text-red-900 placeholder-red-300' : 'border-gray-300 dark:border-zinc-600'
                            }`}
                        />
                        {validation.errors.email && <p className="mt-1 text-sm text-red-600">{validation.errors.email}</p>}
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={formData.password || ''}
                            onChange={handleFieldChange('password')}
                            onBlur={handleFieldBlur('password')}
                            required
                            placeholder="Password"
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-black dark:focus:ring-zinc-500 focus:border-black dark:focus:border-zinc-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s] [&:-webkit-autofill]:[-webkit-text-fill-color:rgb(17,24,39)] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(243,244,246)] ${
                                validation.errors.password ? 'border-red-300 text-red-900 placeholder-red-300' : 'border-gray-300 dark:border-zinc-600'
                            }`}
                        />
                        {validation.errors.password && <p className="mt-1 text-sm text-red-600">{validation.errors.password}</p>}
                    </div>
                    <div className="h-2" />
                    <div>
                        <Button type="submit" variant="secondary" disabled={isLoading || validation.hasErrors} className="w-full">
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
