"use client"

import { Navbar } from "@/components/navbar"
import { destinations } from "@/lib/data"
import { DestinationCard } from "@/components/destination-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, Grid, Map as MapIcon, MapPin, Star } from "lucide-react"
import { Suspense, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LeafletMap } from "@/components/leaflet-map"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

// Loading skeleton for destination cards
function DestinationCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="h-48 w-full bg-muted"></div>
      <div className="p-4">
        <div className="h-5 w-2/3 rounded-md bg-muted mb-2"></div>
        <div className="h-4 w-1/2 rounded-md bg-muted"></div>
      </div>
    </div>
  )
}

// Loading state component
function DestinationsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array(8)
        .fill(0)
        .map((_, i) => (
          <DestinationCardSkeleton key={i} />
        ))}
    </div>
  )
}

export default function DestinationsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("rating")
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid")
  const [selectedDestination, setSelectedDestination] = useState<any | null>(null)
  const [filteredDestinations, setFilteredDestinations] = useState(destinations)

  // Get unique categories from destinations data
  const categories = [
    { id: "all", label: "All Categories" },
    ...Array.from(new Set(destinations.map(dest => dest.categoryName)))
      .map(category => ({
        id: category.toLowerCase().replace(/\s+/g, '-'),
        label: category
      }))
  ]

  // Initialize search term from URL params
  useEffect(() => {
    const urlSearchTerm = searchParams.get('search') || ""
    const urlCategory = searchParams.get('category') || "all"
    const urlSort = searchParams.get('sort') || "rating"
    
    setSearchTerm(urlSearchTerm)
    setSelectedCategory(urlCategory)
    setSortBy(urlSort)
  }, [searchParams])

  // Filter and sort destinations when search term, category, or sort changes
  useEffect(() => {
    let filtered = destinations

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (dest) =>
          dest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dest.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dest.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dest.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dest.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (dest) => dest.categoryName.toLowerCase().replace(/\s+/g, '-') === selectedCategory
      )
    }

    // Apply sorting
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.totalScore - a.totalScore
        case "reviews":
          return b.reviewsCount - a.reviewsCount
        case "name":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    setFilteredDestinations(filtered)
  }, [searchTerm, selectedCategory, sortBy])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateURL()
  }

  const updateURL = () => {
    const params = new URLSearchParams()
    if (searchTerm.trim()) params.set('search', searchTerm.trim())
    if (selectedCategory !== "all") params.set('category', selectedCategory)
    if (sortBy !== "rating") params.set('sort', sortBy)
    
    const queryString = params.toString()
    const url = queryString ? `/destinations?${queryString}` : '/destinations'
    router.push(url, { scroll: false })
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    // Update URL immediately when category changes
    const params = new URLSearchParams()
    if (searchTerm.trim()) params.set('search', searchTerm.trim())
    if (category !== "all") params.set('category', category)
    if (sortBy !== "rating") params.set('sort', sortBy)
    
    const queryString = params.toString()
    const url = queryString ? `/destinations?${queryString}` : '/destinations'
    router.push(url, { scroll: false })
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    // Update URL immediately when sort changes
    const params = new URLSearchParams()
    if (searchTerm.trim()) params.set('search', searchTerm.trim())
    if (selectedCategory !== "all") params.set('category', selectedCategory)
    if (sort !== "rating") params.set('sort', sort)
    
    const queryString = params.toString()
    const url = queryString ? `/destinations?${queryString}` : '/destinations'
    router.push(url, { scroll: false })
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setSortBy("rating")
    router.push('/destinations', { scroll: false })
  }

  const hasActiveFilters = searchTerm.trim() || selectedCategory !== "all" || sortBy !== "rating"

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Explore Destinations</h1>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex flex-1 lg:flex-1">
            <Input 
              type="text" 
              placeholder="search for a destination" 
              className="pr-12 rounded-r-none rounded-l-2xl h-14 text-lg bg-[#F6F6F6] border-0 flex-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit" size="icon" className="h-14 w-14 rounded-l-none rounded-r-2xl bg-brand-primary hover:bg-brand-primaryHover">
              <Search className="h-8 w-8" />
            </Button>
          </form>

          <div className="flex gap-2 lg:flex-shrink-0">
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-48 h-14">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-40 h-14">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rating</SelectItem>
                <SelectItem value="reviews">Most Popular</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex rounded-lg border">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none h-14 px-4 "
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "map" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("map")}
                className="rounded-l-none h-14 px-4"
              >
                <MapIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            Found {filteredDestinations.length} destination{filteredDestinations.length !== 1 ? 's' : ''}
            {searchTerm.trim() && ` for "${searchTerm}"`}
            {selectedCategory !== "all" && ` in ${categories.find(c => c.id === selectedCategory)?.label}`}
            {sortBy !== "rating" && ` sorted by ${sortBy === "reviews" ? "popularity" : sortBy === "name" ? "name" : "rating"}`}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Clear All Filters
            </Button>
          )}
        </div>

        <Suspense fallback={<DestinationsLoading />}>
          {filteredDestinations.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredDestinations.map((destination) => (
                  <DestinationCard key={destination.placeId} destination={destination} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="h-[600px] rounded-lg overflow-hidden border shadow-lg">
                    <LeafletMap
                      locations={filteredDestinations.map((dest) => ({
                        lat: dest.location.lat,
                        lng: dest.location.lng,
                        title: dest.title,
                        placeId: dest.placeId,
                        imageUrl: dest.imageUrl,
                        description: dest.description,
                        totalScore: dest.totalScore,
                        reviewsCount: dest.reviewsCount,
                      }))}
                      selectedLocation={selectedDestination ? {
                        lat: selectedDestination.location.lat,
                        lng: selectedDestination.location.lng,
                        title: selectedDestination.title,
                        placeId: selectedDestination.placeId,
                        imageUrl: selectedDestination.imageUrl,
                        description: selectedDestination.description,
                        totalScore: selectedDestination.totalScore,
                        reviewsCount: selectedDestination.reviewsCount,
                      } : null}
                      onLocationSelect={(location) => {
                        const dest = filteredDestinations.find(d => d.placeId === location.placeId)
                        if (dest) {
                          setSelectedDestination(dest)
                        }
                      }}
                      zoom={5}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Destination List</h2>
                    <Badge variant="secondary">{filteredDestinations.length} locations</Badge>
                  </div>
                  
                  <div className="space-y-3 max-h-[550px] overflow-y-auto pr-2">
                    {filteredDestinations.map((dest) => (
                      <Card
                        key={dest.placeId}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedDestination?.placeId === dest.placeId ? "ring-2 ring-primary shadow-md" : ""
                        }`}
                        onClick={() => setSelectedDestination(dest)}
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={dest.imageUrl || "/placeholder.svg"}
                                alt={dest.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg leading-tight">{dest.title}</h3>
                              <div className="flex items-center text-sm text-muted-foreground mb-2">
                                <MapPin className="h-3 w-3 mr-1" />
                                {dest.city}, {dest.state}
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                                    {dest.totalScore}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    ({dest.reviewsCount.toLocaleString()})
                                  </span>
                                </div>
                                <Link href={`/destinations/${dest.placeId}`}>
                                  <Button variant="outline" size="sm" className="text-xs">
                                    Detail
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No destinations found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm.trim() 
                  ? `No destinations match your search for "${searchTerm}"`
                  : "No destinations match your current filters"
                }. Try adjusting your search or filters.
              </p>
              <Button variant="outline" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            </div>
          )}
        </Suspense>
      </div>
    </main>
  )
}
