import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

const createSupabaseClient = (request: NextRequest) => {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: "", ...options })
        },
      },
    },
  )

  return { supabase, response }
}

const createAdminClient = () => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function proxy(request: NextRequest) {
  const { supabase, response } = createSupabaseClient(request)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const searchParams = request.nextUrl.searchParams

  const hasErrorParam = searchParams.has("error")

  const isAuthPage = pathname.startsWith("/signin") || pathname.startsWith("/signup")

  const isProtectedPage = pathname.startsWith("/dashboard")

  if (!user && isProtectedPage) {
    return NextResponse.redirect(new URL("/signin", request.url))
  }

  if (user && isAuthPage && !hasErrorParam) {
    const adminClient = createAdminClient()

    const { data: adminUser, error } = await adminClient
      .from("admin_users")
      .select("id, is_active")
      .eq("user_id", user.id)
      .single()

    console.log("[v0] Middleware - Admin check for user:", user.id, "Result:", adminUser, "Error:", error)

    // Only redirect to dashboard if user is a valid active admin
    if (!error && adminUser && adminUser.is_active) {
      console.log("[v0] Middleware - User is authorized admin, redirecting to dashboard")
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    console.log("[v0] Middleware - User not authorized as admin, signing out")
    await supabase.auth.signOut()
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
