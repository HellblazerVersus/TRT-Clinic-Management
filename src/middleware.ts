import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes
  if (
    pathname === '/' || 
    pathname === '/login' || 
    pathname === '/signup' || 
    pathname === '/explain' || 
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  // Stripe webhooks are unauthenticated (verified by signature)
  if (pathname === '/api/stripe/webhook') {
    return NextResponse.next();
  }

  // Everything else requires auth
  if (!req.auth) {
    const loginUrl = new URL('/', req.url); // Redirect to landing page instead of /login
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
