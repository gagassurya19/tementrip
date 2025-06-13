"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login } = useUser()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const success = await login(email, password)
      if (success) {
        router.push("/")
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row container mx-auto px-4 md:px-0 overflow-x-hidden">
        <div className="w-full md:w-1/2 bg-brand-secondary mx-0 my-4 md:mx-24 md:my-24 rounded-3xl flex flex-col justify-center">
          <div className="p-4 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome to</h1>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-primary mb-4 md:mb-6">TemanTrip</h2>
            <p className="text-gray-700 mb-6 md:mb-8 text-sm md:text-base">
              Plan your trip based on your preferences with a smart recommendation system. Discover the best
              destinations quickly, easily, and personally.
            </p>
            <div className="relative h-48 md:h-96 w-full">
              <Image src="/images/login.png" alt="Location pin on map" fill className="object-contain" />
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/3 p-4 md:p-8 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold">Sign in</h2>
              <Link href="/register" className="text-brand-primary hover:text-brand-primaryHover hover:underline text-sm md:text-base">
                Register
              </Link>
            </div>

            {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">{error}</div>}

            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter Email"
                  className="h-10 md:h-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="h-10 md:h-12 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-2 md:top-3 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="text-right">
                <Link href="/forgot-password" className="text-xs md:text-sm text-gray-500 hover:underline">
                  Recover Password ?
                </Link>
              </div>

              <Button className="w-full h-10 md:h-12 bg-brand-primary hover:bg-brand-primaryHover" disabled={isSubmitting} type="submit">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
