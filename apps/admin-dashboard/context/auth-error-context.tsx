'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth-service';
import { removeAuthCookie } from '@/utils/auth-cookies';
import { UnauthorizedModal } from '@/components/unauthorized-modal';

interface AuthErrorContextType {
    showUnauthorizedModal: () => void;
}

const AuthErrorContext = createContext<AuthErrorContextType | undefined>(undefined);

export const AuthErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const router = useRouter();

    const showUnauthorizedModal = useCallback(() => {
        setIsModalVisible(true);
    }, []);

    const handleLogoutAndRedirect = useCallback(() => {
        authService.logout();
        removeAuthCookie();
        setIsModalVisible(false);
        router.push('/auth/login');
    }, [router]);

    return (
        <AuthErrorContext.Provider value={{ showUnauthorizedModal }}>
            {children}
            {isModalVisible && <UnauthorizedModal onConfirm={handleLogoutAndRedirect} />}
        </AuthErrorContext.Provider>
    );
};

export const useAuthError = (): AuthErrorContextType => {
    const context = useContext(AuthErrorContext);
    if (context === undefined) {
        throw new Error('useAuthError must be used within an AuthErrorProvider');
    }
    return context;
};
