"use client"

import { Navbar } from "@/components/navbar"
import { useUser } from "@/contexts/user-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bookmark, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function BookmarksPage() {
  const { bookmarks, removeBookmark, isAuthenticated } = useUser()
  const router = useRouter()
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  const handleImageError = (bookmarkId: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [bookmarkId]: true,
    }))
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Saved Places</h1>
        </div>

        {bookmarks.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-medium mb-2">No saved places yet</h2>
            <p className="text-gray-500 mb-6">Start exploring destinations and save your favorites for later</p>
            <Link href="/destinations">
              <Button>Explore Destinations</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bookmarks.map((bookmark) => {
              // Use a fallback image if the original image fails to load
              const imageSrc = imageErrors[bookmark.id]
                ? "/placeholder.svg?height=200&width=300"
                : bookmark.imageUrl || "/placeholder.svg?height=200&width=300"

              return (
                <Card key={bookmark.id} className="overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={imageSrc || "/placeholder.svg"}
                      alt={bookmark.title}
                      fill
                      className="object-cover"
                      onError={() => handleImageError(bookmark.id)}
                      loading="lazy"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => removeBookmark(bookmark.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{bookmark.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {bookmark.city}, {bookmark.state}
                    </p>
                    <div className="flex justify-between">
                      <Link href={`/destinations/${bookmark.placeId}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/booking/${bookmark.placeId}`}>
                        <Button size="sm">Book Now</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
