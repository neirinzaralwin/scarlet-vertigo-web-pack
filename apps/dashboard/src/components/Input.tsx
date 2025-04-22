import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    id: string;
    label: string;
    register: UseFormRegister<any>; // Accept register function
    error?: FieldError; // Accept error object
    // Add any other props the input might need, e.g., type, placeholder, required
}

const Input: React.FC<InputProps> = ({
    id,
    label,
    register,
    error,
    className,
    ...props // Spread the rest of the props (like type, placeholder, required, step, etc.)
}) => {
    const baseClasses =
        'block w-full px-3 py-2 mt-1 text-gray-900 bg-white dark:bg-gray-700 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm';
    const errorClasses = error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600';

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
            </label>
            <input
                id={id}
                {...register(id, {
                    // Add valueAsNumber or valueAsDate if needed based on type
                    valueAsNumber: props.type === 'number',
                })} // Register the input with react-hook-form
                className={`${baseClasses} ${errorClasses} ${className || ''}`}
                aria-invalid={error ? 'true' : 'false'}
                {...props} // Apply other passed props
            />
            {error && (
                <p role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {error.message}
                </p>
            )}
        </div>
    );
};

export default Input;
