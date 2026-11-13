import { parseCookies } from './api/_utils/cookies.js';
import { getSession } from './api/_utils/sessions.js';

export default async function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Public paths that don't require auth
  const publicPaths = ['/login', '/api/auth/login', '/api/auth/logout', '/favicon.ico'];
  const isPublic = publicPaths.some(p => pathname.startsWith(p));

  // Check for session cookie
  const cookies = parseCookies(request.headers.get('cookie'));
  const sessionToken = cookies.session;

  let isAuthenticated = false;
  let userEmail = null;

  if (sessionToken) {
    const session = getSession(sessionToken);
    if (session) {
      isAuthenticated = true;
      userEmail = session.email;
    }
  }

  if (!isAuthenticated && !isPublic) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return Response.redirect(loginUrl, 302);
  }

  // For authenticated requests, continue with user info in headers
  const response = new Response(null, { status: 200 });
  if (isAuthenticated) {
    response.headers.set('x-user-email', userEmail);
    response.headers.set('x-middleware-auth', 'true');
  }
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};