import { Suspense } from "react"
import ResetPasswordForm from "@/components/auth/reset-password-form"
import Logo from "@/components/layout/logo"

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white">
        <div className="absolute top-6 left-6">
          <Logo />
        </div>
        <Suspense fallback={<div className="w-full max-w-md text-center">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-custom-gradient flex-col justify-center items-center p-12 text-white">
        <div className="max-w-md text-center">
          <h2 className="text-4xl font-bold mb-6">Create a Strong Password</h2>
          <p className="text-lg opacity-90 mb-8">
            Choose a secure password to protect your account. We recommend using a combination of letters, numbers, and
            special characters.
          </p>
          <div className="flex justify-center gap-8 text-center">
            <div>
              <p className="text-4xl font-bold">8+</p>
              <p className="text-sm opacity-80">Characters</p>
            </div>
            <div>
              <p className="text-4xl font-bold">100%</p>
              <p className="text-sm opacity-80">Secure</p>
            </div>
            <div>
              <p className="text-4xl font-bold">1-Click</p>
              <p className="text-sm opacity-80">Reset</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
