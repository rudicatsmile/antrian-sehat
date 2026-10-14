import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;

  // 1. Always allow public static assets and API auth hooks
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/auth/send-sms-hook") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/)
  ) {
    return response;
  }

  // 2. Allow public unauthenticated routes
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/layanan") ||
    pathname.startsWith("/jadwal-dokter") ||
    pathname.startsWith("/tentang") ||
    pathname.startsWith("/faq") ||
    pathname.startsWith("/kontak") ||
    pathname.startsWith("/display") ||
    pathname.startsWith("/masuk") ||
    pathname.startsWith("/daftar");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-anon-key";
  const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || supabaseUrl.includes("mock.supabase.co");

  // In mock/development mode without active Supabase credentials, allow navigation smoothly
  if (isMock) {
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If user is not authenticated and trying to access private area
    if (!user && !isPublicRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/masuk";
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // If user is authenticated
    if (user) {
      // Check user role from user_metadata or profiles
      const role = user.app_metadata?.role || user.user_metadata?.role || "pasien";

      // If already logged in and visiting /masuk or /daftar, redirect to appropriate home
      if (pathname === "/masuk" || pathname === "/daftar") {
        const dest = role === "admin" ? "/admin/dashboard" : role === "petugas" ? "/petugas/dashboard" : "/dashboard";
        return NextResponse.redirect(new URL(dest, request.url));
      }

      // Role authorization guards
      if (pathname.startsWith("/admin") && role !== "admin") {
        const dest = role === "petugas" ? "/petugas/dashboard" : "/dashboard";
        return NextResponse.redirect(new URL(dest, request.url));
      }

      if (pathname.startsWith("/petugas") && role !== "petugas" && role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  } catch (error) {
    // If Supabase throws network/config error in middleware, allow request so app doesn't crash
    console.error("Middleware auth error:", error);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
