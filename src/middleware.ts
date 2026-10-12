import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";

export default async function middleware(req: NextRequest) {
  const host = req.headers.get("host")?.split(":")[0];
  if (host === "aoac.in") {
    const url = req.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = "www.aoac.in";
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  const isStaticFile =
    req.nextUrl.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)$/i) ||
    req.nextUrl.pathname.startsWith('/logo') ||
    req.nextUrl.pathname.startsWith('/images') ||
    req.nextUrl.pathname.startsWith('/_next/static');

  const isCrawlMetadata =
    req.nextUrl.pathname === "/robots.txt" ||
    req.nextUrl.pathname === "/sitemap.xml" ||
    req.nextUrl.pathname === "/manifest.webmanifest";

  if (isStaticFile || isCrawlMetadata) {
    return NextResponse.next();
  }

  const session = await auth(); 
  const isLoggedIn = !!session?.user;
  const isPublicPath = req.nextUrl.pathname.startsWith('/auth');

  const isAlwaysPublic = 
    req.nextUrl.pathname === '/' || 
    req.nextUrl.pathname.startsWith('/docs') ||
    req.nextUrl.pathname.startsWith('/products') ||
    req.nextUrl.pathname.startsWith('/product') ||
    req.nextUrl.pathname.startsWith('/search') ||
    req.nextUrl.pathname.startsWith('/about') ||
    req.nextUrl.pathname.startsWith('/contact') ||
    req.nextUrl.pathname.startsWith('/policies') ||
    isCrawlMetadata;

  // If user is logged in and tries to access auth paths
  // redirect them to home page
  if (isLoggedIn && isPublicPath) {
    return NextResponse.redirect(new URL('/', req.url));
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
  runtime: 'nodejs', // Node runtime for database/server dependencies used via auth()
};