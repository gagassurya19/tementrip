"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useUser } from "@/contexts/user-context"
import { User, LogOut, Bookmark, Calendar, Menu, X, Bot } from "lucide-react"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePathname } from "next/navigation"

export function Navbar() {
  const { user, isAuthenticated, logout } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-400">
          TemanTrip
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/destinations"
            className={`text-sm font-medium hover:text-blue-500 ${pathname === "/destinations" ? "text-blue-500" : ""}`}
          >
            Destinations
          </Link>
          <Link
            href="/explore"
            className={`text-sm font-medium hover:text-blue-500 ${pathname === "/explore" ? "text-blue-500" : ""}`}
          >
            Explore
          </Link>
          <Link
            href="/itinerary"
            className={`text-sm font-medium hover:text-blue-500 ${pathname === "/itinerary" ? "text-blue-500" : ""}`}
          >
            Plan Trip
          </Link>
          <Link
            href="/assistant"
            className={`text-sm font-medium hover:text-blue-500 flex items-center gap-1 ${
              pathname === "/assistant" ? "text-blue-500" : ""
            }`}
          >
            <Bot className="h-3 w-3" />
            AI Assistant
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="hidden md:flex items-center gap-4">
                <Link href="/bookmarks">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bookmark className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/bookings">
                  <Button variant="ghost" size="icon">
                    <Calendar className="h-5 w-5" />
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5 text-sm font-medium">{user?.name}</div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/bookmarks">Saved Places</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/bookings">My Bookings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/assistant">AI Assistant</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </>
          ) : (
            <>
              <div className="hidden md:block">
                <Link href="/login">
                  <Button variant="secondary" className="bg-blue-400 text-white hover:bg-blue-500">
                    Sign in
                  </Button>
                </Link>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 space-y-4">
            <div className="space-y-2">
              <Link
                href="/destinations"
                className="block px-2 py-1 hover:bg-gray-100 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Destinations
              </Link>
              <Link
                href="/explore"
                className="block px-2 py-1 hover:bg-gray-100 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Explore
              </Link>
              <Link
                href="/itinerary"
                className="block px-2 py-1 hover:bg-gray-100 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Plan Trip
              </Link>
              <Link
                href="/assistant"
                className="block px-2 py-1 hover:bg-gray-100 rounded flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Bot className="h-4 w-4" />
                AI Assistant
              </Link>
            </div>

            {isAuthenticated ? (
              <div className="space-y-2 border-t pt-2">
                <Link
                  href="/profile"
                  className="block px-2 py-1 hover:bg-gray-100 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/bookmarks"
                  className="block px-2 py-1 hover:bg-gray-100 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Saved Places
                </Link>
                <Link
                  href="/bookings"
                  className="block px-2 py-1 hover:bg-gray-100 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Bookings
                </Link>
                <button
                  className="w-full text-left px-2 py-1 text-red-500 hover:bg-gray-100 rounded flex items-center"
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </button>
              </div>
            ) : (
              <div className="space-y-2 border-t pt-2">
                <Link
                  href="/login"
                  className="block px-2 py-1 hover:bg-gray-100 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="block px-2 py-1 hover:bg-gray-100 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
