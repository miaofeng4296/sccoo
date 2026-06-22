import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  // Detect city from subdomain (e.g., beijing.localhost → beijing)
  const parts = hostname.split('.');
  let citySubdomain: string | null = null;
  if (parts.length > 2 && parts[0] !== 'www') {
    citySubdomain = parts[0]!;
  }

  // Protected routes
  const protectedPaths = ['/post/', '/user/', '/admin/'];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected) {
    const sessionToken =
      request.cookies.get('authjs.session-token')?.value ||
      request.cookies.get('__Secure-authjs.session-token')?.value;

    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('jump', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();

  // Set city subdomain as header for server components
  if (citySubdomain) {
    response.headers.set('x-city-subdomain', citySubdomain);
    // Also set as cookie for client components
    response.cookies.set('city-subdomain', citySubdomain, {
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
};
