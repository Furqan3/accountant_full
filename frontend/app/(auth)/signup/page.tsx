import SignUpForm from "@/components/auth/signup-form"
import Logo from "@/components/layout/logo"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white">
        <div className="absolute top-6 left-6">
          <Logo />
        </div>
        <SignUpForm />
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-custom-gradient flex-col justify-center items-center p-12 text-white">
        <div className="max-w-md text-center">
          <h2 className="text-4xl font-bold mb-6">Join Thousands of UK Directors</h2>
          <p className="text-lg opacity-90 mb-8">
            Create your account today and experience hassle-free company filings. Our platform guides you through every
            step with confidence.
          </p>
          <ul className="text-left space-y-4">
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-sm">✓</span>
              Filed within 24 hours
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-sm">✓</span>
              Companies House receipt included
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-sm">✓</span>
              100% accuracy guaranteed
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-sm">✓</span>
              Dedicated support team
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
