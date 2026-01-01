import { Suspense } from "react"
import ForgotPasswordForm from "@/components/auth/forgot-password-form"
import Logo from "@/components/layout/logo"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white">
        <div className="absolute top-6 left-6">
          <Logo />
        </div>
        <Suspense fallback={<div className="w-full max-w-md text-center">Loading...</div>}>
          <ForgotPasswordForm />
        </Suspense>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-custom-gradient flex-col justify-center items-center p-12 text-white">
        <div className="max-w-md text-center">
          <h2 className="text-4xl font-bold mb-6">Secure Password Reset</h2>
          <p className="text-lg opacity-90 mb-8">
            We'll send you a secure link to reset your password. Your account security is our top priority.
          </p>
          <div className="flex justify-center gap-8 text-center">
            <div>
              <p className="text-4xl font-bold">256-bit</p>
              <p className="text-sm opacity-80">Encryption</p>
            </div>
            <div>
              <p className="text-4xl font-bold">100%</p>
              <p className="text-sm opacity-80">Secure</p>
            </div>
            <div>
              <p className="text-4xl font-bold">24/7</p>
              <p className="text-sm opacity-80">Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
