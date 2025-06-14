"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useUser } from "@/contexts/user-context"
import { User, LogOut, Bookmark, Calendar, Menu, X, Bot, MapPin, Compass } from "lucide-react"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export function Navbar() {
  const { user, isAuthenticated, logout, bookmarks } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const bookmarkCount = bookmarks?.length || 0

  return (
    <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-brand-primary hover:opacity-80 transition-opacity">
          TemanTrip
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/destinations"
            className={`text-sm font-medium hover:text-brand-primary flex items-center gap-1 transition-colors ${
              pathname === "/destinations" ? "text-brand-primary" : ""
            }`}
          >
            <Compass className="h-4 w-4" />
            Jelajahi
          </Link>
          <Link
            href="/itinerary"
            className={`text-sm font-medium hover:text-brand-primary flex items-center gap-1 transition-colors ${
              pathname === "/itinerary" ? "text-brand-primary" : ""
            }`}
          >
            <Calendar className="h-4 w-4" />
            Buat Itinerary
          </Link>
          <Link
            href="/assistant"
            className={`text-sm font-medium hover:text-brand-primary flex items-center gap-1 transition-colors ${
              pathname === "/assistant" ? "text-brand-primary" : ""
            }`}
          >
            <Bot className="h-4 w-4" />
            AI Assistant
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden md:flex items-center gap-3">
                <Link href="/bookmarks">
                  <Button variant="ghost" size="sm" className="relative flex items-center gap-2">
                    <Bookmark className="h-4 w-4" />
                    <span className="hidden lg:inline">Wishlist</span>
                    {bookmarkCount > 0 && (
                      <Badge variant="default" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-1 text-xs">
                        {bookmarkCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden lg:inline">{user?.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                      Halo, {user?.name}!
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profil Saya
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/bookmarks" className="flex items-center">
                        <Bookmark className="mr-2 h-4 w-4" />
                        Wishlist ({bookmarkCount})
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/bookings" className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Booking Saya
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/itinerary" className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        Buat Itinerary
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Keluar</span>
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
              <div className="hidden md:flex items-center gap-2">
                <Link href="/register">
                  <Button variant="ghost" size="sm">
                    Daftar
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="sm" className="bg-brand-primary hover:bg-brand-primaryHover text-white">
                    Masuk
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
        <div className="md:hidden border-t bg-white">
          <div className="container py-4 space-y-4">
            <div className="space-y-2">
              <Link
                href="/destinations"
                className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors ${
                  pathname === "/destinations" ? "bg-blue-50 text-blue-600" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Compass className="h-4 w-4" />
                Jelajahi Destinasi
              </Link>
              <Link
                href="/itinerary"
                className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors ${
                  pathname === "/itinerary" ? "bg-blue-50 text-blue-600" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Calendar className="h-4 w-4" />
                Buat Itinerary
              </Link>
              <Link
                href="/assistant"
                className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors ${
                  pathname === "/assistant" ? "bg-blue-50 text-blue-600" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Bot className="h-4 w-4" />
                AI Assistant
              </Link>
            </div>

            {isAuthenticated ? (
              <div className="space-y-2 border-t pt-4">
                <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
                  Akun Saya
                </div>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Profil Saya
                </Link>
                <Link
                  href="/bookmarks"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Bookmark className="h-4 w-4" />
                  Wishlist
                  {bookmarkCount > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {bookmarkCount}
                    </Badge>
                  )}
                </Link>
                <Link
                  href="/bookings"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Calendar className="h-4 w-4" />
                  Booking Saya
                </Link>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </div>
            ) : (
              <div className="space-y-2 border-t pt-4">
                <Link
                  href="/register"
                  className="block px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Daftar Akun
                </Link>
                <Link
                  href="/login"
                  className="block px-3 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primaryHover transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Masuk
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
