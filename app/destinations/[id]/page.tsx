"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { destinations } from "@/lib/data"
import { Clock, MapPin, Phone, Star, Bookmark, BookmarkCheck } from "lucide-react"
import Image from "next/image"
import { notFound, useRouter } from "next/navigation"
import { LeafletMap } from "@/components/leaflet-map"
import { useUser } from "@/contexts/user-context"
import { useState, useEffect } from "react"

export default function DestinationDetail({ params }: { params: { id: string } }) {
  const destination = destinations.find((d) => d.placeId === params.id)
  const { isAuthenticated, bookmarks, addBookmark, removeBookmark } = useUser()
  const router = useRouter()

  const [isBookmarked, setIsBookmarked] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (isAuthenticated && bookmarks) {
      setIsBookmarked(bookmarks.some((b) => b.placeId === params.id))
    }
  }, [isAuthenticated, bookmarks, params.id])

  if (!destination) {
    notFound()
  }

  // Use a fallback image if the original image fails to load
  const imageSrc = imageError
    ? "/placeholder.svg?height=400&width=600"
    : destination.imageUrl || "/placeholder.svg?height=400&width=600"

  const handleBookmarkToggle = () => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (isBookmarked) {
      const bookmark = bookmarks.find((b) => b.placeId === params.id)
      if (bookmark) {
        removeBookmark(bookmark.id)
      }
    } else {
      addBookmark(destination)
    }
  }

  const handleBookNow = () => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    router.push(`/booking/${destination.placeId}`)
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold mb-4">{destination.title}</h1>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 font-medium">{destination.totalScore}</span>
              </div>
              <span className="text-muted-foreground">({destination.reviewsCount.toLocaleString()} reviews)</span>
              <div className="flex items-center ml-4">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="ml-1 text-muted-foreground">
                  {destination.city}, {destination.state}
                </span>
              </div>
            </div>

            <div className="relative h-[400px] w-full rounded-lg overflow-hidden mb-8">
              <Image
                src={imageSrc || "/placeholder.svg"}
                alt={destination.title}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                priority
              />
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">About</h2>
                <p className="text-gray-700">{destination.description}</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4">Location</h2>
                <LeafletMap
                  locations={[
                    {
                      lat: destination.location.lat,
                      lng: destination.location.lng,
                      title: destination.title,
                      placeId: destination.placeId,
                    },
                  ]}
                  center={{
                    lat: destination.location.lat,
                    lng: destination.location.lng,
                  }}
                  zoom={14}
                />
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4">Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <span>
                      {destination.city}, {destination.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-blue-500" />
                    <span>{destination.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span>Recommended: {destination.tripDuration} days trip</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Plan Your Trip</h3>
                <div className="space-y-4">
                  <Button className="w-full" onClick={handleBookNow}>
                    Book Now
                  </Button>
                  <Button variant="outline" className="w-full flex items-center gap-2" onClick={handleBookmarkToggle}>
                    {isBookmarked ? (
                      <>
                        <BookmarkCheck className="h-5 w-5" />
                        Saved to Wishlist
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-5 w-5" />
                        Save to Wishlist
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
