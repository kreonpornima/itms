import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('itms-token')?.value;
  const { pathname } = request.nextUrl;

  // Protected routes
  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/tickets') ||
    pathname.startsWith('/kb') ||
    pathname.startsWith('/settings');

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If logged in and hitting /login, redirect to dashboard
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/tickets/:path*',
    '/kb/:path*',
    '/settings/:path*',
    '/login',
  ],
};
