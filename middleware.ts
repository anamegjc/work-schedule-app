import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Redirect paths based on user role
    if (path.startsWith('/dashboard')) {
      if (token?.role === 'ADMIN' && !path.startsWith('/dashboard/admin')) {
        return NextResponse.redirect(new URL('/dashboard/admin', req.url));
      }
      if (token?.role === 'MANAGER' && !path.startsWith('/dashboard/manager')) {
        return NextResponse.redirect(new URL('/dashboard/manager', req.url));
      }
      if (token?.role === 'STUDENT' && !path.startsWith('/dashboard/student')) {
        return NextResponse.redirect(new URL('/dashboard/student', req.url));
      }
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*']
};