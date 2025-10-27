import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function middleware(request: NextRequest) {
  // Get the session using NextAuth
  const session = await auth();

  // Check if the route requires authentication
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard") ||
                          request.nextUrl.pathname.startsWith("/profile") ||
                          request.nextUrl.pathname.startsWith("/settings") ||
                          request.nextUrl.pathname.startsWith("/admin");

  // Check if the route is an auth route
  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") ||
                     request.nextUrl.pathname.startsWith("/register") ||
                     request.nextUrl.pathname.startsWith("/api/auth");

  // If it's a protected route and user is not authenticated, redirect to login
  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and trying to access auth routes, redirect to dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // For API routes, check authentication
  if (request.nextUrl.pathname.startsWith("/api/") && 
      !request.nextUrl.pathname.startsWith("/api/auth")) {
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has required role for admin routes
    // Note: We'll handle admin role checking in the API routes themselves
    // to avoid PrismaClient usage in Edge Runtime
    if (request.nextUrl.pathname.startsWith("/api/admin")) {
      // Basic role check using session data (no database call)
      if (session.user?.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};