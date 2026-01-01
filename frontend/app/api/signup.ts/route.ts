import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { createServiceRoleClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const fullName = formData.get("fullName") as string
    const companyName = formData.get("companyName") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const profilePic = formData.get("profilePic") as File | null

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Full name, email, and password are required" },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Sign up the user with Supabase Auth FIRST
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName,
        },
      },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      )
    }

    // NOW upload profile picture (using service role to bypass RLS)
    let avatarUrl = null
    if (profilePic && profilePic.size > 0) {
      const serviceSupabase = createServiceRoleClient()
      const fileExt = profilePic.name.split('.').pop()
      const fileName = `${authData.user.id}.${fileExt}` // Use user ID for filename
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await serviceSupabase.storage
        .from('profiles')
        .upload(filePath, profilePic, {
          upsert: true // Overwrite if exists
        })

      if (uploadError) {
        console.error('Profile picture upload error:', uploadError)
        // Continue with signup even if upload fails
      } else {
        const { data } = serviceSupabase.storage
          .from('profiles')
          .getPublicUrl(filePath)
        avatarUrl = data.publicUrl
        console.log('Profile picture uploaded successfully:', avatarUrl)

        // Update profile with avatar URL (service role bypasses RLS)
        const { error: updateError } = await (serviceSupabase as any)
          .from('profiles')
          .update({ avatar_url: avatarUrl })
          .eq('id', authData.user.id)

        if (updateError) {
          console.error('Failed to update profile with avatar URL:', updateError)
        }
      }
    }

    // Profile and preferences are created automatically via database trigger

    return NextResponse.json(
      {
        message: "User created successfully. Please check your email to verify your account.",
        userId: authData.user.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
