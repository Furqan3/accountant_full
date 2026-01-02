"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/app/shared/logo";
import { useAuth } from "@/contexts/auth-context";

export default function SignIn() {
  const router = useRouter();
  const { signIn, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If the user is already signed in, redirect to the dashboard.
  // The middleware and dashboard layout will handle authorization.
  useEffect(() => {
    if (!authLoading && user) {
      console.log("✅ User is signed in, redirecting to dashboard...");
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: signInError } = await signIn(email, password);

      if (signInError) {
        setError(signInError.message || "Failed to sign in");
        setLoading(false);
      } else {
        console.log("✅ Sign in successful, waiting for redirect...");
        // Loading state will remain true until redirect happens
        // This prevents multiple submissions
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <Logo className="text-4xl" />
          <p className="text-zinc-600 mb-8 pt-5">
            Sign in to access your dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-700 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 text-black py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-zinc-50"
                required
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border text-black border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-zinc-50"
                required
                disabled={loading}
              />
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-primary focus:ring-primary border-zinc-300 rounded"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-zinc-700"
                >
                  Remember me
                </label>
              </div>
              <a
                href="#"
                className="text-sm text-primary hover:text-primary-dark"
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-zinc-600">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-primary hover:text-primary-dark font-medium"
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
        <div className="max-w-lg text-white">
          <h2 className="text-5xl font-bold mb-6">
            Simplify Compliance Management
          </h2>
          <p className="text-xl text-white/90 mb-8">
            "Redefining how businesses handle filings. Powerful automation and expert precision to keep your operations running smoothly."
          </p>
        </div>
      </div>
    </div>
  );
}
