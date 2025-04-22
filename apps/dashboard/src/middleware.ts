import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths that are public (don't require authentication)
const PUBLIC_PATHS = ['/auth/login'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get the token from the cookies
    const token = request.cookies.get('token')?.value;

    // Check if the path is public
    const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

    // If trying to access a protected route without a token, redirect to login
    if (!isPublicPath && !token) {
        const loginUrl = new URL('/auth/login', request.url);
        // Optionally add a callbackUrl query parameter
        // loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If trying to access a public route (like login) with a token, redirect to home
    if (isPublicPath && token) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Allow the request to proceed if:
    // 1. It's a public path and there's no token
    // 2. It's a protected path and there is a token
    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (like svgs)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)',
    ],
};
