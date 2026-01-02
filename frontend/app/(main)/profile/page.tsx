"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import Footer from "@/components/layout/footer"
import PageHero from "@/components/shared/page-hero"
import { Mail, Building2, User as UserIcon } from "lucide-react"
import { toast } from "react-toastify"

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, loading, refreshProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || "",
        companyName: profile.company_name || "",
        email: user?.email || "",
      })
    } else if (user) {
      setFormData({
        fullName: user.user_metadata?.full_name || "",
        companyName: user.user_metadata?.company_name || "",
        email: user.email || "",
      })
    }
  }, [profile, user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          companyName: formData.companyName,
        }),
      })

      if (!response.ok) {
        toast.error("Failed to update profile")
        return
      }

      toast.success("Profile updated successfully!")
      await refreshProfile()
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Something went wrong")
    } finally {
      setIsSaving(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const userInitial = (formData.fullName?.charAt(0) || user.email?.charAt(0) || "U").toUpperCase()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PageHero title="My Profile" />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-lg  border border-gray-200 overflow-hidden">
          {/* Header Section with User Initial */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 h-32"></div>

          <div className="px-6 pb-6">
            <div className="relative -mt-16 mb-6">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-teal-700 flex items-center justify-center text-white text-5xl font-bold ">
                {userInitial}
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition font-medium"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        // Reset form data
                        if (profile) {
                          setFormData({
                            fullName: profile.full_name || "",
                            companyName: profile.company_name || "",
                            email: user?.email || "",
                          })
                        }
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition font-medium disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      Full Name
                    </div>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {formData.fullName || "Not set"}
                    </p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </div>
                  </label>
                  <p className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600">
                    {formData.email}
                    <span className="ml-2 text-xs text-gray-500">(Cannot be changed)</span>
                  </p>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Company Name
                    </div>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter your company name (optional)"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {formData.companyName || "Not set"}
                    </p>
                  )}
                </div>
              </div>

              {/* Account Information */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Account Created</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Sign In</p>
                    <p className="text-gray-900 font-medium">
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
