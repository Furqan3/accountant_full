"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import Logo from "./logo"
import { Menu, X, MessageCircle, Calendar, ChevronDown } from "lucide-react"

interface HeaderAuthProps {
  userName?: string
  userAvatar?: string
}

const HeaderAuth: React.FC<HeaderAuthProps> = ({
  userName = "Daniyal Khan",
  userAvatar = "/professional-man-avatar.png",
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "#", label: "About Us" },
    { href: "#", label: "Services" },
    { href: "/company-search", label: "Company Search" },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <header className="relative flex h-14 items-center justify-between px-5 bg-white rounded-lg">
      <Logo />

      <nav className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 space-x-6 text-gray-600">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={`hover:text-gray-900 transition ${isActive(link.href) ? "text-gray-900 font-medium" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Right side icons and user profile - desktop */}
      <div className="hidden md:flex items-center gap-3">
        <Link href="/messages" className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
          <MessageCircle className="w-5 h-5 text-gray-600" />
        </Link>
        <Link href="/orders" className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
          <Calendar className="w-5 h-5 text-gray-600" />
        </Link>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg hover:bg-gray-50 transition"
          >
            <Image
              src={userAvatar || "/placeholder.svg"}
              alt={userName}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
            <span className="text-gray-800 font-medium">{userName}</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
              <Link href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                Profile
              </Link>
              <Link href="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                My Orders
              </Link>
              <Link href="/messages" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                Messages
              </Link>
              <Link href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                Settings
              </Link>
              <hr className="my-2 border-gray-100" />
              <Link href="/signin" className="block px-4 py-2 text-red-600 hover:bg-gray-50">
                Sign Out
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden">
        <button className="p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-lg p-4 md:hidden z-50">
          <nav className="flex flex-col space-y-3 text-gray-600">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`hover:text-gray-900 py-2 ${isActive(link.href) ? "text-gray-900 font-medium" : ""}`}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2" />
            <div className="flex items-center gap-3 py-2">
              <Image
                src={userAvatar || "/placeholder.svg"}
                alt={userName}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
              <span className="text-gray-800 font-medium">{userName}</span>
            </div>
            <Link href="#" className="hover:text-gray-900 py-2 pl-2">
              Profile
            </Link>
            <Link href="/orders" className="hover:text-gray-900 py-2 pl-2">
              My Orders
            </Link>
            <Link href="/messages" className="hover:text-gray-900 py-2 pl-2">
              Messages
            </Link>
            <Link href="#" className="hover:text-gray-900 py-2 pl-2">
              Settings
            </Link>
            <Link href="/signin" className="text-red-600 hover:text-red-700 py-2 pl-2">
              Sign Out
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

export default HeaderAuth
