"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { TravelAssistant } from "@/components/travel-assistant"
import { useUser } from "@/contexts/user-context"

export default function AssistantPage() {
  const { isAuthenticated } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Travel Assistant</h1>
          <p className="text-muted-foreground">
            Get personalized travel advice, itineraries, and destination insights powered by AI
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <TravelAssistant />
        </div>
      </div>
    </main>
  )
}
