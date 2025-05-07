import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req) {
  const token = req.cookies.get('token')?.value;
  const url = req.nextUrl.clone();

  const isProtectedRoute =
    url.pathname.startsWith('/dashboard') ||
    url.pathname.startsWith('/teams') ||
    url.pathname.startsWith('/projects') ||
    url.pathname.startsWith('/notifications');

  let isValid = false;

  if (token) {
    try {
      await jwtVerify(token, jwtSecret);
      isValid = true;
    } catch (err) {
      isValid = false;
    }
  }

  if (!isValid && isProtectedRoute) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  if (isValid && url.pathname === '/') {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/teams/:path*',
    '/projects/:path*',
    '/notifications/:path*',
  ],
};
