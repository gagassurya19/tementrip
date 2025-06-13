"use client"

import { Navbar } from "@/components/navbar"
import { destinations } from "@/lib/data"
import { DestinationCard } from "@/components/destination-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Suspense, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"

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
  const [filteredDestinations, setFilteredDestinations] = useState(destinations)

  // Initialize search term from URL params
  useEffect(() => {
    const urlSearchTerm = searchParams.get('search') || ""
    setSearchTerm(urlSearchTerm)
  }, [searchParams])

  // Filter destinations when search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = destinations.filter(
        (dest) =>
          dest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dest.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dest.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dest.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dest.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredDestinations(filtered)
    } else {
      setFilteredDestinations(destinations)
    }
  }, [searchTerm])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/destinations?search=${encodeURIComponent(searchTerm.trim())}`, { scroll: false })
    } else {
      router.push('/destinations', { scroll: false })
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
    router.push('/destinations', { scroll: false })
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Explore Destinations</h1>

        <form onSubmit={handleSearch} className="flex max-w-md mb-8">
          <Input 
            type="text" 
            placeholder="search for a destination" 
            className="pr-12 rounded-r-none rounded-l-2xl h-14 text-lg bg-[#F6F6F6] border-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" size="icon" className="h-14 w-14 rounded-l-none rounded-r-2xl bg-brand-primary hover:bg-brand-primaryHover">
            <Search className="h-8 w-8" />
          </Button>
        </form>

        {/* Search Results Info */}
        {searchTerm.trim() && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">
              Found {filteredDestinations.length} destination{filteredDestinations.length !== 1 ? 's' : ''} for "{searchTerm}"
            </p>
            <Button variant="outline" size="sm" onClick={clearSearch}>
              Clear Search
            </Button>
          </div>
        )}

        <Suspense fallback={<DestinationsLoading />}>
          {filteredDestinations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredDestinations.map((destination) => (
                <DestinationCard key={destination.placeId} destination={destination} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No destinations found</h3>
              <p className="text-muted-foreground mb-4">
                No destinations match your search for "{searchTerm}". Try a different search term.
              </p>
              <Button variant="outline" onClick={clearSearch}>
                View All Destinations
              </Button>
            </div>
          )}
        </Suspense>
      </div>
    </main>
  )
}
