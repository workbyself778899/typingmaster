import { NextRequest, NextResponse } from 'next/server';

// Paths that require authentication
const protectedPaths = ['/dashboard', '/lessons', '/practice', '/statistics', '/profile', '/admin'];

// Paths that require admin role
const adminPaths = ['/admin'];

// Paths that should redirect to dashboard if already authenticated
const authPaths = ['/login', '/register', '/forgot-password', '/reset-password'];

/**
 * Lightweight JWT decode for Edge Runtime.
 * `jsonwebtoken` uses Node.js crypto which is unavailable in Edge Runtime,
 * so we decode the payload from the token's base64url-encoded middle segment
 * and check the expiry. Full cryptographic verification happens server-side
 * in API routes.
 */
function decodeTokenPayload(token: string): { userId: string; email: string; role: string; exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Base64url decode the payload
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(payload));

    // Check expiration
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null;
    }

    if (!decoded.userId || !decoded.email) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  // Check if path requires authentication
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));
  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  if (isProtectedPath) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = decodeTokenPayload(token);
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('auth_token');
      return response;
    }

    // Check admin access
    if (isAdminPath && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPath && token) {
    const payload = decodeTokenPayload(token);
    if (payload) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
