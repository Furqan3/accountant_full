import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/lib/database.types"

// This is a server component layout that will wrap the dashboard pages
// It's responsible for checking if the user is an authenticated admin.

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/signin")
  }

  console.log("[v0] Dashboard Layout - User ID:", user.id)
  console.log("[v0] Dashboard Layout - User Email:", user.email)

  // Check if the user is an active admin
  const { data: adminUser, error } = await supabase
    .from("admin_users")
    .select("id, is_active")
    .eq("user_id", user.id)
    .single<{ id: string; is_active: boolean }>()

  console.log("[v0] Dashboard Layout - Admin User Query Result:", adminUser)
  console.log("[v0] Dashboard Layout - Admin User Query Error:", error)

  // If there was an error, or the user is not found, or is not active, redirect
  if (error || !adminUser || !adminUser.is_active) {
    const reason = error
      ? `Database error: ${error.message}`
      : !adminUser
        ? "No admin_users record found for this user"
        : "Admin user is not active (is_active = false)"
    console.log("[v0] Dashboard Layout - Authorization failed:", reason)

    // It's good practice to sign out the user if their admin record is invalid
    await supabase.auth.signOut()
    redirect("/signin?error=unauthorized")
  }

  console.log("[v0] Dashboard Layout - Authorization successful, rendering dashboard")

  // If all checks pass, render the children
  return <>{children}</>
}
