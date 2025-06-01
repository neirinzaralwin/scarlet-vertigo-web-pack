import { z } from 'zod';

export const EmailSchema = z
    .string()
    .email('Please enter a valid email address')
    .max(50, 'Email must not exceed 50 characters')
    .refine((email) => !/\s/.test(email), {
        message: 'Email cannot contain whitespace',
    });

export const PasswordSchema = z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(50, 'Password must not exceed 50 characters')
    .refine((password) => !/\s/.test(password), {
        message: 'Password cannot contain whitespace',
    });

export const StrongPasswordSchema = z
    .string()
    .min(12, 'Strong password must be at least 12 characters long')
    .max(50, 'Password must not exceed 50 characters')
    .refine((password) => !/\s/.test(password), {
        message: 'Password cannot contain whitespace',
    });

export const LoginCredentialsSchema = z.object({
    email: EmailSchema,
    password: PasswordSchema,
});

export const LoginResponseSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string().optional(),
    user: z
        .object({
            id: z.string(),
            email: z.string().email(),
            name: z.string().optional(),
            role: z.string().optional(),
        })
        .optional(),
});

export const RefreshTokenSchema = z.object({
    refreshToken: z.string(),
});

export const ChangePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: StrongPasswordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RefreshToken = z.infer<typeof RefreshTokenSchema>;
export type ChangePassword = z.infer<typeof ChangePasswordSchema>;
