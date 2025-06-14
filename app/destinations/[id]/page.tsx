"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { destinations } from "@/lib/data"
import { 
  Clock, 
  MapPin, 
  Phone, 
  Star, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  Calendar,
  Users,
  Camera,
  Navigation,
  Globe,
  Info,
  Heart,
  MessageCircle,
  Eye,
  EyeOff
} from "lucide-react"
import Image from "next/image"
import { notFound, useRouter } from "next/navigation"
import { LeafletMap } from "@/components/leaflet-map"
import { useUser } from "@/contexts/user-context"
import { useState, useEffect } from "react"

// Function to calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c // Distance in kilometers
}

export default function DestinationDetail({ params }: { params: { id: string } }) {
  const destination = destinations.find((d) => d.placeId === params.id)
  const { isAuthenticated, bookmarks, addBookmark, removeBookmark } = useUser()
  const router = useRouter()

  const [isBookmarked, setIsBookmarked] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [showNearbyPlaces, setShowNearbyPlaces] = useState(false)

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
    ? "/placeholder.svg?height=600&width=800"
    : destination.imageUrl || "/placeholder.svg?height=600&width=800"

  // Find related destinations in the same city
  const relatedDestinations = destinations
    .filter((d) => d.city === destination.city && d.placeId !== destination.placeId)
    .slice(0, 3)

  // Find nearby places within 2km radius
  const nearbyPlaces = destinations
    .filter((d) => {
      if (d.placeId === destination.placeId) return false
      const distance = calculateDistance(
        destination.location.lat,
        destination.location.lng,
        d.location.lat,
        d.location.lng
      )
      return distance <= 2 // Within 2km
    })
    .map((d) => ({
      ...d,
      distance: calculateDistance(
        destination.location.lat,
        destination.location.lng,
        d.location.lat,
        d.location.lng
      )
    }))
    .sort((a, b) => a.distance - b.distance) // Sort by distance

  // Prepare map locations based on whether nearby places are shown
  const mapLocations = showNearbyPlaces 
    ? [
        // Current destination first (so its popup opens by default)
        {
          lat: destination.location.lat,
          lng: destination.location.lng,
          title: destination.title,
          placeId: destination.placeId,
          imageUrl: destination.imageUrl,
          description: destination.description,
          totalScore: destination.totalScore,
          reviewsCount: destination.reviewsCount,
          isMainDestination: true,
        },
        // Then nearby places
        ...nearbyPlaces.map((place) => ({
          lat: place.location.lat,
          lng: place.location.lng,
          title: place.title,
          placeId: place.placeId,
          imageUrl: place.imageUrl,
          description: place.description,
          totalScore: place.totalScore,
          reviewsCount: place.reviewsCount,
          isMainDestination: false,
          distance: place.distance,
        }))
      ]
    : [
        {
          lat: destination.location.lat,
          lng: destination.location.lng,
          title: destination.title,
          placeId: destination.placeId,
          imageUrl: destination.imageUrl,
          description: destination.description,
          totalScore: destination.totalScore,
          reviewsCount: destination.reviewsCount,
          isMainDestination: true,
        },
      ]

  // Set the selected location to the main destination when showing nearby places
  const selectedLocationForMap = showNearbyPlaces ? mapLocations[0] : null

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: destination.title,
          text: destination.description,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      // You could show a toast notification here
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section with Image */}
      <div className="relative">
        <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
          <Image
            src={imageSrc}
            alt={destination.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Floating Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="bg-white/90 backdrop-blur-sm hover:bg-white"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="bg-white/90 backdrop-blur-sm hover:bg-white"
              onClick={handleBookmarkToggle}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-blue-600" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              <Badge variant="secondary" className="mb-4 bg-white/90 text-gray-900">
                {destination.categoryName}
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                {destination.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{destination.totalScore}</span>
                  <span className="text-sm">({destination.reviewsCount.toLocaleString()} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{destination.city}, {destination.state}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{destination.tripDuration} days recommended</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      About This Destination
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {destination.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                        <Star className="h-8 w-8 text-blue-600" />
                        <div>
                          <div className="font-semibold text-blue-900">{destination.totalScore}/5</div>
                          <div className="text-sm text-blue-700">Rating</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                        <Users className="h-8 w-8 text-green-600" />
                        <div>
                          <div className="font-semibold text-green-900">{destination.reviewsCount.toLocaleString()}</div>
                          <div className="text-sm text-green-700">Reviews</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                        <Calendar className="h-8 w-8 text-purple-600" />
                        <div>
                          <div className="font-semibold text-purple-900">{destination.tripDuration} Days</div>
                          <div className="text-sm text-purple-700">Recommended</div>
                        </div>
                      </div>
                    </div>

                    {/* Related Destinations */}
                    {relatedDestinations.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-4">More in {destination.city}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {relatedDestinations.map((related) => (
                            <Card key={related.placeId} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                  onClick={() => router.push(`/destinations/${related.placeId}`)}>
                              <div className="relative h-32">
                                <Image
                                  src={related.imageUrl || "/placeholder.svg"}
                                  alt={related.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <CardContent className="p-3">
                                <h4 className="font-medium text-sm mb-1">{related.title}</h4>
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span>{related.totalScore}</span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="location" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Navigation className="h-5 w-5" />
                        Location & Map
                      </div>
                      <Button
                        variant={showNearbyPlaces ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowNearbyPlaces(!showNearbyPlaces)}
                        className="flex items-center gap-2"
                      >
                        {showNearbyPlaces ? (
                          <>
                            <EyeOff className="h-4 w-4" />
                            Hide Nearby Places
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            Show Nearby Places
                          </>
                        )}
                      </Button>
                    </CardTitle>
                    {showNearbyPlaces && nearbyPlaces.length > 0 && (
                      <div className="text-sm text-gray-600">
                        Showing {nearbyPlaces.length} places within 2km radius
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="h-[400px] w-full rounded-lg overflow-hidden border shadow-sm">
                        <LeafletMap
                          locations={mapLocations}
                          center={{
                            lat: destination.location.lat,
                            lng: destination.location.lng,
                          }}
                          zoom={showNearbyPlaces ? 13 : 15}
                          className="h-full w-full"
                          selectedLocation={selectedLocationForMap}
                          onLocationSelect={(location) => {
                            if (location.placeId !== destination.placeId) {
                              router.push(`/destinations/${location.placeId}`)
                            }
                          }}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                          <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                          <div>
                            <div className="font-medium">Address</div>
                            <div className="text-sm text-gray-600">
                              {destination.city}, {destination.state}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                          <Globe className="h-5 w-5 text-gray-600 mt-0.5" />
                          <div>
                            <div className="font-medium">Coordinates</div>
                            <div className="text-sm text-gray-600">
                              {destination.location.lat.toFixed(6)}, {destination.location.lng.toFixed(6)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Nearby Places List */}
                      {showNearbyPlaces && nearbyPlaces.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-blue-600" />
                            Nearby Places (within 2km)
                          </h4>
                          <div className="space-y-3 max-h-60 overflow-y-auto">
                            {nearbyPlaces.slice(0, 5).map((place) => (
                              <div
                                key={place.placeId}
                                className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => router.push(`/destinations/${place.placeId}`)}
                              >
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                  <Image
                                    src={place.imageUrl || "/placeholder.svg"}
                                    alt={place.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-medium text-sm truncate">{place.title}</h5>
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                      <span>{place.totalScore}</span>
                                    </div>
                                    <span>•</span>
                                    <span>{place.distance.toFixed(1)}km away</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          {nearbyPlaces.length > 5 && (
                            <div className="text-center mt-3">
                              <Button variant="outline" size="sm">
                                View All {nearbyPlaces.length} Places
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {showNearbyPlaces && nearbyPlaces.length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>No nearby places found within 2km radius</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Destination Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 border rounded-lg">
                          <Phone className="h-5 w-5 text-blue-500" />
                          <div>
                            <div className="font-medium">Contact</div>
                            <div className="text-sm text-gray-600">
                              {destination.phone || "Not available"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 border rounded-lg">
                          <Clock className="h-5 w-5 text-blue-500" />
                          <div>
                            <div className="font-medium">Recommended Duration</div>
                            <div className="text-sm text-gray-600">
                              {destination.tripDuration} days
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 border rounded-lg">
                          <MapPin className="h-5 w-5 text-blue-500" />
                          <div>
                            <div className="font-medium">Category</div>
                            <div className="text-sm text-gray-600">
                              {destination.categoryName}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 border rounded-lg">
                          <Star className="h-5 w-5 text-blue-500" />
                          <div>
                            <div className="font-medium">Popularity</div>
                            <div className="text-sm text-gray-600">
                              {destination.reviewsCount.toLocaleString()} reviews
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Reviews & Ratings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Star className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{destination.totalScore}/5</h3>
                      <p className="text-gray-600 mb-4">Based on {destination.reviewsCount.toLocaleString()} reviews</p>
                      <div className="text-sm text-gray-500">
                        Detailed reviews will be available soon
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Plan Your Visit</h3>
                <div className="space-y-4">
                  <Button className="w-full h-12 text-lg" onClick={handleBookNow}>
                    <Calendar className="h-5 w-5 mr-2" />
                    Book Your Trip
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full h-12 flex items-center gap-2" 
                    onClick={handleBookmarkToggle}
                  >
                    {isBookmarked ? (
                      <>
                        <BookmarkCheck className="h-5 w-5 text-blue-600" />
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
                
                <Separator className="my-6" />
                
                <div className="space-y-3">
                  <h4 className="font-medium">Quick Facts</h4>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Best for:</span>
                      <span className="font-medium">{destination.categoryName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{destination.tripDuration} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{destination.totalScore}</span>
                      </div>
                    </div>
                    {showNearbyPlaces && nearbyPlaces.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nearby places:</span>
                        <span className="font-medium">{nearbyPlaces.length} within 2km</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weather/Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Travel Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div>
                      <div className="font-medium">Best Time to Visit</div>
                      <div className="text-gray-600">Year-round destination</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <div>
                      <div className="font-medium">Getting There</div>
                      <div className="text-gray-600">Accessible by public transport</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                    <div>
                      <div className="font-medium">What to Bring</div>
                      <div className="text-gray-600">Camera, comfortable shoes, sunscreen</div>
                    </div>
                  </div>
                  {showNearbyPlaces && nearbyPlaces.length > 0 && (
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                      <div>
                        <div className="font-medium">Explore Nearby</div>
                        <div className="text-gray-600">Check out {nearbyPlaces.length} nearby attractions</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
