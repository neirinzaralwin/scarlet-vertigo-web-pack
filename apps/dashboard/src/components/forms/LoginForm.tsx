'use client';

import { useState } from 'react';
import { useValidation } from '@/hooks/useValidation';
import { LoginCredentialsSchema, type LoginCredentials } from '@/validation/schemas/auth.schemas';
import { authService } from '@/services/auth.service';

export default function LoginForm() {
    const [formData, setFormData] = useState<Partial<LoginCredentials>>({
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const validation = useValidation(LoginCredentialsSchema, {
        validateOnBlur: true,
        validateOnChange: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate the entire form
        const validationResult = validation.validate(formData);

        if (!validationResult.isValid) {
            return; // Stop if validation fails
        }

        setIsLoading(true);
        try {
            // Type guard: we know data is not null because isValid is true
            if (validationResult.data) {
                await authService.login(validationResult.data);
                // Handle successful login (redirect, etc.)
            }
        } catch (error) {
            console.error('Login failed:', error);
            // Handle login error
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
    };

    const handleFieldBlur = (field: keyof LoginCredentials) => (e: React.FocusEvent<HTMLInputElement>) => {
        validation.validateField(field, e.target.value, formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleFieldChange('email')}
                    onBlur={handleFieldBlur('email')}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                        validation.errors.email ? 'border-red-300 text-red-900 placeholder-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                />
                {validation.errors.email && <p className="mt-1 text-sm text-red-600">{validation.errors.email}</p>}
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    value={formData.password || ''}
                    onChange={handleFieldChange('password')}
                    onBlur={handleFieldBlur('password')}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                        validation.errors.password ? 'border-red-300 text-red-900 placeholder-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your password"
                />
                {validation.errors.password && <p className="mt-1 text-sm text-red-600">{validation.errors.password}</p>}
            </div>

            <button
                type="submit"
                disabled={isLoading || validation.hasErrors}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
        </form>
    );
}
