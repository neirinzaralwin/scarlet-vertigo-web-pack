'use client';
import React from 'react';
import Button from './Button'; // Assuming Button component exists

interface UnauthorizedModalProps {
    onConfirm: () => void;
}

const UnauthorizedModal: React.FC<UnauthorizedModalProps> = ({ onConfirm }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">Unauthorized Access</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Your session has expired or you are not authorized. Please log in again.</p>
                <div className="flex justify-end">
                    <Button onClick={onConfirm} variant="danger" className="w-auto">
                        Go to Login
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedModal;
