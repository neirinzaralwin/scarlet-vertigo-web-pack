# Using Centralized Validation - Quick Examples

## Basic Form Pattern

```tsx
import { useValidation } from '@/hooks/useValidation';
import { YourSchema, type YourType } from '@/validation/schemas';

function YourForm() {
    const [formData, setFormData] = useState<Partial<YourType>>({});
    const validation = useValidation(YourSchema);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = validation.validate(formData);
        if (result.isValid && result.data) {
            // Use validated data
            await yourService.submitData(result.data);
        }
    };

    const handleFieldChange = (field: keyof YourType) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        if (validation.errors[field]) {
            validation.clearFieldError(field);
        }
    };

    const handleFieldBlur = (field: keyof YourType) => (e: React.FocusEvent<HTMLInputElement>) => {
        validation.validateField(field, e.target.value, formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input value={formData.fieldName || ''} onChange={handleFieldChange('fieldName')} onBlur={handleFieldBlur('fieldName')} className={validation.errors.fieldName ? 'error' : ''} />
            {validation.errors.fieldName && <span>{validation.errors.fieldName}</span>}

            <button type="submit" disabled={validation.hasErrors}>
                Submit
            </button>
        </form>
    );
}
```

## With the createFieldHandlers utility

```tsx
function YourForm() {
    const [formData, setFormData] = useState<Partial<YourType>>({});
    const validation = useValidation(YourSchema);

    // Create handlers for a specific field
    const emailHandlers = validation.createFieldHandlers('email', formData);

    return (
        <form onSubmit={handleSubmit}>
            <input
                value={formData.email || ''}
                onChange={(e) => {
                    setFormData((prev) => ({ ...prev, email: e.target.value }));
                    emailHandlers.onChange?.(e.target.value);
                }}
                onBlur={(e) => emailHandlers.onBlur?.(e.target.value)}
            />
        </form>
    );
}
```

## API Route Usage

```tsx
// pages/api/users.ts or app/api/users/route.ts
import { validateData } from '@/validation/validator';
import { UserSchema } from '@/validation/schemas';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validUser = validateData(UserSchema, body);

        // Process validated data
        const result = await createUser(validUser);
        return Response.json(result);
    } catch (error) {
        if (error instanceof ValidationError) {
            return Response.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        // Handle other errors
    }
}
```

## Service Usage

```tsx
// services/user.service.ts
import { validateData } from '@/validation/validator';
import { UserSchema, UserUpdateSchema } from '@/validation/schemas';

export const userService = {
    create: async (userData: unknown) => {
        const validData = validateData(UserSchema, userData);
        return apiService.post('/users', validData);
    },

    update: async (id: string, userData: unknown) => {
        const validData = validateData(UserUpdateSchema, userData);
        return apiService.put(`/users/${id}`, validData);
    },
};
```
