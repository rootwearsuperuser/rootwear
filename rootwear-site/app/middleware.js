// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Handle Shopify checkout redirects
  if (pathname.includes('/checkouts/') || pathname.includes('/cart/')) {
    // If someone tries to access Shopify checkout URLs directly, redirect to our cart
    if (pathname.includes('/checkouts/')) {
      return NextResponse.redirect(new URL('/cart', request.url));
    }
  }

  // Handle collections redirects
  if (pathname === '/collections' || pathname === '/collections/all') {
    return NextResponse.redirect(new URL('/products', request.url));
  }

  // Handle other common Shopify routes
  if (pathname.startsWith('/admin')) {
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};