import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; // Add variant prop
}

const Button: React.FC<ButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
    // Define base styles
    const baseStyles =
        'flex justify-center px-6 py-3 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

    // Define variant styles
    const variantStyles = {
        primary: 'text-white bg-black dark:bg-white dark:text-black border border-transparent hover:bg-zinc-800 dark:hover:bg-gray-300',
        secondary: 'text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700',
        danger: 'text-white bg-red-600 border border-transparent hover:bg-red-700',
        ghost: 'text-gray-700 dark:text-gray-300 bg-transparent border border-transparent hover:bg-gray-100 dark:hover:bg-zinc-800',
    };

    return (
        <button
            {...props}
            className={`${baseStyles} ${variantStyles[variant]} ${className}`} // Combine base, variant, and custom styles
        >
            {children}
        </button>
    );
};

export default Button;
