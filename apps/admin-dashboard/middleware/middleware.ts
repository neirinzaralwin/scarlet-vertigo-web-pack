import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/auth/login'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const token = request.cookies.get('token')?.value;

    const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

    if (!isPublicPath && !token) {
        const loginUrl = new URL('/auth/login', request.url);

        return NextResponse.redirect(loginUrl);
    }

    if (isPublicPath && token) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

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
