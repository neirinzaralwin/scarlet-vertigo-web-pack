'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { removeAuthCookie } from '@/utils/authCookies';
import { authService } from '@/services/auth.service';
import UnauthorizedModal from '@/components/UnauthorizedModal'; // We will create this next

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
        authService.logout(); // Optional: Call backend logout if implemented
        removeAuthCookie();
        setIsModalVisible(false);
        router.push('/auth/login');
        // Optionally add a small delay or wait for navigation before full reload
        // setTimeout(() => window.location.reload(), 100); // Force reload if state isn't clearing properly
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
