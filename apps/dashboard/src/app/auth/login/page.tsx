'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form'; // Import useForm
import { zodResolver } from '@hookform/resolvers/zod'; // Import zodResolver
import Button from '@/components/Button';
import Input from '@/components/Input'; // Import the reusable Input component
import { authService } from '@/services/auth.service';

const LoginSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

type LoginFormInputs = z.infer<typeof LoginSchema>;

export default function LoginPage() {
    // Use react-hook-form for form state management and validation
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormInputs>({
        resolver: zodResolver(LoginSchema), // Use zodResolver for validation
    });

    const [apiError, setApiError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Updated handleLogin to use react-hook-form's handleSubmit
    const handleLogin = async (data: LoginFormInputs) => {
        setApiError(null);
        setIsLoading(true);

        try {
            const { token } = await authService.login(data);

            console.log('Login successful, token received:', token);

            sessionStorage.setItem('token', token);

            router.push('/');
        } catch (error) {
            console.error('Login failed:', error);
            setApiError(error instanceof Error ? error.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
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
                {/* Use handleSubmit from react-hook-form */}
                <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
                    <Input
                        id="email"
                        label="Email address"
                        type="email"
                        autoComplete="email"
                        register={register} // Pass register function
                        error={errors.email} // Pass email error
                        required
                        placeholder="you@example.com"
                    />
                    <Input
                        id="password"
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        register={register} // Pass register function
                        error={errors.password} // Pass password error
                        required
                        placeholder="Password"
                    />
                    <div className="h-2" />
                    <div>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </div>
                </form>{' '}
                {/* Ensure form tag is closed */}
            </div>
        </div>
    );
}
