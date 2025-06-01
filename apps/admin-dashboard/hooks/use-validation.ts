import { useState, useCallback } from 'react';
import { z } from 'zod';
import { validateDataSafe } from '@/validation/validator';

interface UseValidationOptions {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
}

interface ValidationResult<T> {
    data: T | null;
    errors: Record<string, string>;
    isValid: boolean;
    hasErrors: boolean;
}

export function useValidation<T>(schema: z.ZodSchema<T>, options: UseValidationOptions = {}) {
    const { validateOnChange = false, validateOnBlur = true } = options;

    const [validationResult, setValidationResult] = useState<ValidationResult<T>>({
        data: null,
        errors: {},
        isValid: false,
        hasErrors: false,
    });

    const validateField = useCallback(
        (fieldName: string, value: unknown, currentData?: Record<string, unknown>) => {
            // Create test data with the current field value
            const testData = {
                ...currentData,
                [fieldName]: value,
            };

            const result = validateDataSafe(schema, testData);

            let fieldError = '';
            if (!result.success) {
                // Find the first error for this specific field
                const fieldErrorObj = result.errors.find((error) => error.path.length > 0 && error.path[0] === fieldName);
                if (fieldErrorObj) {
                    fieldError = fieldErrorObj.message;
                }
            }

            setValidationResult((prev) => {
                const newErrors = {
                    ...prev.errors,
                    [fieldName]: fieldError,
                };

                const hasErrors = Object.values(newErrors).some((error) => error !== '');

                return {
                    ...prev,
                    errors: newErrors,
                    hasErrors,
                };
            });
        },
        [schema],
    );

    const validate = useCallback(
        (data: unknown): ValidationResult<T> => {
            const result = validateDataSafe(schema, data);

            if (result.success) {
                const validResult: ValidationResult<T> = {
                    data: result.data,
                    errors: {},
                    isValid: true,
                    hasErrors: false,
                };
                setValidationResult(validResult);
                return validResult;
            }

            const errors: Record<string, string> = {};
            result.errors.forEach((error) => {
                const fieldName = error.path.join('.');
                if (!errors[fieldName]) {
                    errors[fieldName] = error.message;
                }
            });

            const invalidResult: ValidationResult<T> = {
                data: null,
                errors,
                isValid: false,
                hasErrors: true,
            };
            setValidationResult(invalidResult);
            return invalidResult;
        },
        [schema],
    );

    const clearErrors = useCallback(() => {
        setValidationResult((prev) => ({
            ...prev,
            errors: {},
            hasErrors: false,
        }));
    }, []);

    const clearFieldError = useCallback((fieldName: string) => {
        setValidationResult((prev) => {
            const newErrors = {
                ...prev.errors,
                [fieldName]: '',
            };

            const hasErrors = Object.values(newErrors).some((error) => error !== '');

            return {
                ...prev,
                errors: newErrors,
                hasErrors,
            };
        });
    }, []);

    return {
        ...validationResult,
        validate,
        validateField,
        clearErrors,
        clearFieldError,
        // Event handlers for forms
        createFieldHandlers: (fieldName: string, currentData?: Record<string, unknown>) => ({
            onChange: validateOnChange ? (value: unknown) => validateField(fieldName, value, currentData) : undefined,
            onBlur: validateOnBlur ? (value: unknown) => validateField(fieldName, value, currentData) : undefined,
        }),
    };
}
