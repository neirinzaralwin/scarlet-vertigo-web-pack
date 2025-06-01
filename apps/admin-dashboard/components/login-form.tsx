'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useValidation } from '@/hooks/use-validation';
import { LoginCredentialsSchema, type LoginCredentials } from '@/validation/schemas/auth.schemas';
import { authService } from '@/services/auth-service';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
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

    const handleFieldChange = (field: keyof LoginCredentials) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (validation.errors[field]) validation.clearFieldError(field);

        if (apiError) setApiError(null);
    };

    const handleFieldBlur = (field: keyof LoginCredentials) => (e: React.FocusEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.trim()) validation.validateField(field, value, formData);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email?.trim() || !formData.password?.trim()) {
            setApiError('Please fill in all fields');
            return;
        }

        const validationResult = validation.validate(formData);
        if (!validationResult.isValid) return;

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

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>SCARLET VERTIGO</CardTitle>
                    <CardDescription>Welcome to Scarlet Vertigo's control center</CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="flex flex-col gap-6">
                            <div className="flex-col">
                                <div className="grid gap-3">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="m@example.com" required onChange={handleFieldChange('email')} onBlur={handleFieldBlur('email')} />
                                </div>
                                {validation.errors.email && <p className="mt-1 text-sm text-red-600">{validation.errors.email}</p>}
                            </div>

                            <div className="flex-col">
                                <div className="grid gap-3">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" type="password" required onChange={handleFieldChange('password')} onBlur={handleFieldBlur('password')} />
                                </div>
                                {validation.errors.password && <p className="mt-1 text-sm text-red-600">{validation.errors.password}</p>}
                            </div>

                            <Button type="submit" className="w-full">
                                Login
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
