import Cookies from 'js-cookie';

// Function to set the authentication token in a cookie
export const setAuthCookie = (token: string) => {
    Cookies.set('token', token, {
        expires: 7, // Cookie expires in 7 days
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict', // Helps prevent CSRF
    });
};

// Function to get the authentication token from the cookie
export const getAuthCookie = (): string | undefined => {
    return Cookies.get('token');
};

// Function to remove the authentication token cookie
export const removeAuthCookie = () => {
    Cookies.remove('token');
};
