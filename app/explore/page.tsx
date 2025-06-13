"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { LeafletMap } from "@/components/leaflet-map"
import { destinations } from "@/lib/data"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import Link from "next/link"

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDestination, setSelectedDestination] = useState<any | null>(null)

  const filteredDestinations = searchTerm
    ? destinations.filter(
        (dest) =>
          dest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dest.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dest.state.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : destinations

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Explore Maps</h1>

        <div className="flex max-w-md mb-8">
          <Input type="text" placeholder="search for a destination" className="pr-12 rounded-r-none rounded-l-2xl h-14 text-lg bg-[#F6F6F6] border-0" value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} />
          <Button size="icon" className="h-14 w-14 rounded-l-none rounded-r-2xl bg-brand-primary hover:bg-brand-primaryHover">
            <Search className="h-8 w-8" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="h-[600px] rounded-lg overflow-hidden border">
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
            <h2 className="text-xl font-semibold">Destinations</h2>
            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-2">
              {filteredDestinations.map((dest) => (
                <Card
                  key={dest.placeId}
                  className={`cursor-pointer transition-all ${selectedDestination?.placeId === dest.placeId ? "ring-2 ring-blue-500" : ""}`}
                  onClick={() => setSelectedDestination(dest)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-medium">{dest.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {dest.city}, {dest.state}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center">
                        <span className="text-sm font-medium">{dest.totalScore}</span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({dest.reviewsCount.toLocaleString()} reviews)
                        </span>
                      </div>
                      <Link href={`/destinations/${dest.placeId}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
