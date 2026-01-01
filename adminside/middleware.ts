import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log("Middleware - Path:", request.nextUrl.pathname);

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("Middleware - User:", user?.email || "Not authenticated");

  const isAuthPage = request.nextUrl.pathname.startsWith('/signin') ||
                     request.nextUrl.pathname.startsWith('/signup');
  const isProtectedPage = !isAuthPage && request.nextUrl.pathname !== '/';

  // If user is not authenticated and trying to access protected page
  if (!user && isProtectedPage) {
    console.log("Middleware - Redirecting to signin (not authenticated)");
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (user && isAuthPage) {
    console.log("Middleware - Redirecting to dashboard (already authenticated)");
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  console.log("Middleware - Allowing request");
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
