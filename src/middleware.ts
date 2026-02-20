import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";

export default async function middleware(req: NextRequest) {
  const session = await auth(); 
  const isLoggedIn = !!session?.user;
  const isPublicPath = req.nextUrl.pathname.startsWith('/auth');
  
  // Check if it's a static file (images, logos, etc.)
  const isStaticFile = 
    req.nextUrl.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)$/i) ||
    req.nextUrl.pathname.startsWith('/logo') ||
    req.nextUrl.pathname.startsWith('/images') ||
    req.nextUrl.pathname.startsWith('/_next/static');
  
  // Define additional public paths
  const isAlwaysPublic = 
    req.nextUrl.pathname === '/' || 
    req.nextUrl.pathname.startsWith('/docs') ||
    req.nextUrl.pathname.startsWith('/products') ||
    req.nextUrl.pathname.startsWith('/product') ||
    req.nextUrl.pathname.startsWith('/search') ||
    req.nextUrl.pathname.startsWith('/about') ||
    req.nextUrl.pathname.startsWith('/contact');

  // If user is logged in and tries to access auth paths
  // redirect them to home page
  if (isLoggedIn && isPublicPath) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Allow static files to pass through without authentication
  if (isStaticFile) {
    return NextResponse.next();
  }

  // If user is not logged in and tries to access protected paths
  // redirect them to login page
  if (!isLoggedIn && !isPublicPath && !isAlwaysPublic) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Allow all other cases
  return NextResponse.next();
}

// Configure Middleware Matcher
export const config = {
  // Match all paths except api routes, static files, and other assets
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)$).*)'],
  runtime: 'nodejs', // Use Node.js runtime instead of Edge Runtime for Prisma compatibility
};