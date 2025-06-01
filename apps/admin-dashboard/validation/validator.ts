import { z } from 'zod';

export class ValidationError extends Error {
    public readonly errors: z.ZodIssue[];

    constructor(errors: z.ZodIssue[]) {
        const message = errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        super(`Validation failed: ${message}`);
        this.name = 'ValidationError';
        this.errors = errors;
    }
}

/**
 * Validates data against a Zod schema
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns The validated and parsed data
 * @throws ValidationError if validation fails
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);

    if (!result.success) {
        throw new ValidationError(result.error.errors);
    }

    return result.data;
}

/**
 * Validates data against a Zod schema and returns result with success flag
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns Object with success flag and either data or errors
 */
export function validateDataSafe<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T; errors?: never } | { success: false; data?: never; errors: z.ZodIssue[] } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    return { success: false, errors: result.error.errors };
}

/**
 * Middleware-style validator for API routes or form submissions
 * @param schema - The Zod schema to validate against
 * @returns A function that validates data
 */
export function createValidator<T>(schema: z.ZodSchema<T>) {
    return (data: unknown): T => {
        return validateData(schema, data);
    };
}
