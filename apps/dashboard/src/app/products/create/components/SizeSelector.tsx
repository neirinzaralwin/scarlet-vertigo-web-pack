'use client';

import React from 'react';
import { Size } from '@/services/size.service';

interface SizeSelectorProps {
    sizes: Size[];
    selectedSizeId: string;
    onChange: (sizeId: string) => void;
    error?: string;
    disabled?: boolean;
}

export default function SizeSelector({
    sizes,
    selectedSizeId,
    onChange,
    error, // Note: error prop is passed but not currently used for styling the select itself, as it's optional
    disabled = false,
}: SizeSelectorProps) {
    return (
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl shadow border border-zinc-700">
            <h2 className="text-lg font-medium mb-4">Size (Optional)</h2>
            <select
                id="size"
                value={selectedSizeId}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`w-full p-2 border ${error ? 'border-red-500' : 'border-gray-300 dark:border-zinc-700'} rounded-md bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                <option value="">Select size (optional)</option>
                {sizes.map((size) => (
                    <option key={size.id} value={size.id}>
                        {size.name}
                    </option>
                ))}
            </select>
            {/* Error display could be added here if needed, though Zod schema doesn't enforce it currently */}
            {/* {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>} */}
        </div>
    );
}
