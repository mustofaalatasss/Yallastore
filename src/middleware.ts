import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Proteksi Admin UI Routes
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    // Di Edge runtime, kita cek cookie secara manual untuk performa
    const sessionToken = request.cookies.get("better-auth.session_token")?.value;
    const secureSessionToken = request.cookies.get("__Secure-better-auth.session_token")?.value;
    
    if (!sessionToken && !secureSessionToken) {
      // Redirect ke login jika tidak ada token
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Proteksi API Admin Routes di level Middleware (Double Protection)
  const isAdminAPI = 
    pathname.startsWith("/api/dashboard") ||
    pathname.startsWith("/api/revenue") ||
    pathname.startsWith("/api/upload") ||
    (pathname.startsWith("/api/products") && request.method !== "GET") ||
    (pathname === "/api/orders" && request.method === "GET"); // Let route handlers handle PATCH auth for dummy payments

  if (isAdminAPI) {
    const sessionToken = request.cookies.get("better-auth.session_token")?.value;
    // Cek juga cookie versi secure (production)
    const secureSessionToken = request.cookies.get("__Secure-better-auth.session_token")?.value;
    
    if (!sessionToken && !secureSessionToken) {
      return NextResponse.json(
        { error: "Unauthorized access blocked by middleware" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

// Konfigurasi route mana saja yang akan dilewati middleware ini
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
