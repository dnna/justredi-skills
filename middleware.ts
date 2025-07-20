import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthFromRequest,
  validateAdminCredentials,
  createUnauthorizedResponse,
} from './lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect API admin routes, let admin pages handle their own auth
  if (pathname.startsWith('/api/admin')) {
    const auth = getAuthFromRequest(request);

    if (!auth || !validateAdminCredentials(auth.username, auth.password)) {
      return createUnauthorizedResponse();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
