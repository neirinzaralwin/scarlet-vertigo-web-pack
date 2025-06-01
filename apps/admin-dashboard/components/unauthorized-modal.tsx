'use client';

import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface UnauthorizedModalProps {
    onConfirm: () => void;
}

export const UnauthorizedModal: React.FC<UnauthorizedModalProps> = ({ onConfirm }) => {
    return (
        <AlertDialog open={true}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Session Expired</AlertDialogTitle>
                    <AlertDialogDescription>Your session has expired or you are not authorized to access this resource. You will be redirected to the login page.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={onConfirm}>Continue to Login</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
