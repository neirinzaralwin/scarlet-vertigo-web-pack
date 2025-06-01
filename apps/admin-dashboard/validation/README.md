# Validation Architecture

This directory contains a centralized validation system using Zod schemas. This approach separates validation concerns from business logic and provides reusable, type-safe validation throughout the application.

## Structure

```
validation/
├── schemas/           # Zod schemas organized by domain
│   ├── auth.schemas.ts
│   ├── product.schemas.ts
│   ├── category.schemas.ts
│   └── index.ts       # Central schema exports
├── validator.ts       # Validation utilities and error handling
└── index.ts          # Main exports
```

## Benefits of This Approach

1. **Separation of Concerns**: Validation logic is separate from business logic
2. **Reusability**: Schemas can be used across services, components, and API routes
3. **Type Safety**: Automatic TypeScript types generated from schemas
4. **Centralized**: All validation rules in one place, easier to maintain
5. **Consistent Error Handling**: Standardized error messages and handling
6. **Testing**: Validation logic can be tested independently

## Usage Examples

### In Services

```typescript
import { validateData } from '@/validation/validator';
import { LoginCredentialsSchema } from '@/validation/schemas/auth.schemas';

// Clean service focused on business logic
export const authService = {
    login: async (credentials: unknown) => {
        // Validate input at the service boundary
        const validCredentials = validateData(LoginCredentialsSchema, credentials);

        // Business logic here...
        const response = await apiCall(validCredentials);

        // Validate output
        const validResponse = validateData(LoginResponseSchema, response);
        return validResponse;
    },
};
```

### In React Components with useValidation Hook

```typescript
import { useValidation } from '@/hooks/useValidation';
import { LoginCredentialsSchema } from '@/validation/schemas';

function LoginForm() {
    const validation = useValidation(LoginCredentialsSchema);

    const handleSubmit = (formData: unknown) => {
        const result = validation.validate(formData);
        if (result.isValid) {
            // Submit valid data
            authService.login(result.data);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Form fields with validation.errors */}
        </form>
    );
}
```

### In API Routes (if using Next.js API routes)

```typescript
import { validateData } from '@/validation/validator';
import { ProductSchema } from '@/validation/schemas';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validProduct = validateData(ProductSchema, body);

        // Process valid data...
        const result = await createProduct(validProduct);

        return Response.json(result);
    } catch (error) {
        if (error instanceof ValidationError) {
            return Response.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        // Handle other errors...
    }
}
```

## Schema Organization

### By Domain

- `auth.schemas.ts`: Authentication related schemas
- `product.schemas.ts`: Product management schemas
- `category.schemas.ts`: Category management schemas
- Add more as needed (user.schemas.ts, order.schemas.ts, etc.)

### Schema Naming Convention

- Base schemas: `EntitySchema` (e.g., `ProductSchema`)
- Update schemas: `EntityUpdateSchema` (partial schemas for updates)
- Query schemas: `EntityQuerySchema` (for filtering/pagination)
- Response schemas: `EntityResponseSchema` (API response validation)

## Error Handling

The `ValidationError` class provides structured error information:

```typescript
try {
    validateData(schema, data);
} catch (error) {
    if (error instanceof ValidationError) {
        // error.errors contains detailed Zod error information
        console.log(error.errors); // Array of ZodIssue objects
    }
}
```

## Best Practices

1. **Validate at Boundaries**: Always validate data when it enters your system (API endpoints, service methods)
2. **Use Type Inference**: Use `z.infer<typeof Schema>` for TypeScript types
3. **Compose Schemas**: Build complex schemas from simpler ones
4. **Custom Error Messages**: Provide user-friendly error messages in schemas
5. **Schema Reuse**: Share schemas between frontend and backend if possible
6. **Refinements**: Use Zod refinements for complex validation rules

## Migration from Inline Validation

When migrating existing code:

1. Extract Zod schemas to appropriate schema files
2. Replace inline `.parse()` calls with `validateData()` utility
3. Update error handling to use `ValidationError`
4. Update imports to use centralized schemas
5. Remove redundant validation code from services

## Testing

Schemas can be tested independently:

```typescript
import { ProductSchema } from '@/validation/schemas';

describe('ProductSchema', () => {
    it('should validate valid product data', () => {
        const validProduct = {
            name: 'Test Product',
            price: 29.99,
            categoryId: 'cat-123',
        };

        expect(() => ProductSchema.parse(validProduct)).not.toThrow();
    });

    it('should reject invalid product data', () => {
        const invalidProduct = {
            name: '', // Empty name should fail
            price: -10, // Negative price should fail
        };

        expect(() => ProductSchema.parse(invalidProduct)).toThrow();
    });
});
```
