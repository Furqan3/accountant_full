"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import Logo from "./logo"
import { Menu, X, MessageCircle, Calendar, ChevronDown, User, LogOut, ShoppingCart } from "lucide-react"
import { useCart } from "@/context/cart-context"

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, profile, loading, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { totalItems } = useCart()

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/services", label: "Services" },
    { href: "/company-search", label: "Company Search" },
  ]

  const isActive = (href: string) => pathname === href

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [userMenuOpen])

  // Use profile data first, fallback to user metadata
  const userName = profile?.full_name || user?.user_metadata?.full_name || user?.email || "User"
  const userInitial = (userName?.charAt(0) || "U").toUpperCase()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <header className="relative flex h-14 items-center justify-between px-5 bg-white rounded-lg ">
      <Logo />

      {/* Desktop Navigation - Centered */}
      <nav className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 space-x-8 text-gray-600">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={`hover:text-gray-900 transition-colors font-medium ${
              isActive(link.href) ? "text-gray-900" : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Right side - Desktop */}
      <div className="hidden md:flex items-center gap-3">
        <Link
          href="/checkout"
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition relative"
        >
          <ShoppingCart className="w-5 h-5 text-gray-600" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#004250] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
        {user && (
          <>
            <Link
              href="/messages"
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <MessageCircle className="w-5 h-5 text-gray-600" />
            </Link>
            <Link
              href="/orders"
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <Calendar className="w-5 h-5 text-gray-600" />
            </Link>
          </>
        )}

        {loading ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            <div className="w-32 h-6 bg-gray-200 animate-pulse rounded" />
          </div>
        ) : user ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-semibold border border-gray-200">
                {userInitial}
              </div>
              <span className="text-gray-800 font-medium">{userName}</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  userMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* User Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg  border border-gray-100 py-2 z-50">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <Link
                  href="/orders"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Calendar className="w-4 h-4" />
                  My Orders
                </Link>
                <Link
                  href="/messages"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <MessageCircle className="w-4 h-4" />
                  Messages
                </Link>
                <hr className="my-2 border-gray-100" />
                <button
                  onClick={() => {
                    setUserMenuOpen(false)
                    handleSignOut()
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          // Unauthenticated state
          <>
            <Link
              href="/signin"
              className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-teal-700 hover:bg-teal-800 text-white font-medium px-5 py-2 rounded-lg transition"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <div className="md:hidden flex items-center gap-2">
        <Link href="/checkout" className="p-2 relative">
          <ShoppingCart className="w-6 h-6 text-gray-600" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#004250] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
        <button
          className="p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white  rounded-b-lg p-4 md:hidden z-50">
          <nav className="flex flex-col space-y-3 text-gray-600">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`hover:text-gray-900 py-2 font-medium ${
                  isActive(link.href) ? "text-gray-900" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <hr className="my-4 border-gray-200" />

            {user ? (
              <>
                <div className="flex items-center gap-3 py-3">
                  <div className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center font-semibold text-lg border border-gray-200">
                    {userInitial}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{userName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>

                <Link
                  href="/profile"
                  className="flex items-center gap-3 py-2 pl-2 hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <Link
                  href="/orders"
                  className="flex items-center gap-3 py-2 pl-2 hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Calendar className="w-4 h-4" />
                  My Orders
                </Link>
                <Link
                  href="/messages"
                  className="flex items-center gap-3 py-2 pl-2 hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MessageCircle className="w-4 h-4" />
                  Messages
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleSignOut()
                  }}
                  className="flex items-center gap-3 py-2 pl-2 text-red-600 hover:text-red-700 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="hover:text-gray-900 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-teal-700 hover:bg-teal-800 text-white font-medium px-4 py-2 rounded-lg text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header