import { Suspense } from "react"
import SignInForm from "@/components/auth/signin-form"
import Logo from "@/components/layout/logo"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white">
        <div className="absolute top-6 left-6">
          <Logo />
        </div>
        <Suspense fallback={<div className="w-full max-w-md text-center">Loading...</div>}>
          <SignInForm />
        </Suspense>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-custom-gradient flex-col justify-center items-center p-12 text-white">
        <div className="max-w-md text-center">
          <h2 className="text-4xl font-bold mb-6">Fast & Secure Company Filing</h2>
          <p className="text-lg opacity-90 mb-8">
            File your confirmation statements, annual accounts, and company documents online in minutes. Professional,
            reliable service trusted by thousands of UK directors.
          </p>
          <div className="flex justify-center gap-8 text-center">
            <div>
              <p className="text-4xl font-bold">20+</p>
              <p className="text-sm opacity-80">Years Experience</p>
            </div>
            <div>
              <p className="text-4xl font-bold">8K+</p>
              <p className="text-sm opacity-80">Happy Clients</p>
            </div>
            <div>
              <p className="text-4xl font-bold">100%</p>
              <p className="text-sm opacity-80">Accuracy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
