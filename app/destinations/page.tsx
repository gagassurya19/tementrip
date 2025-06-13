import { Navbar } from "@/components/navbar"
import { destinations } from "@/lib/data"
import { DestinationCard } from "@/components/destination-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Suspense } from "react"

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
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Explore Destinations</h1>

        <div className="flex max-w-md mb-8">
          <Input type="text" placeholder="search for a destination" className="pr-12 rounded-r-none rounded-l-2xl h-14 text-lg bg-[#F6F6F6] border-0" />
          <Button size="icon" className="h-14 w-14 rounded-l-none rounded-r-2xl bg-brand-primary hover:bg-brand-primaryHover">
            <Search className="h-8 w-8" />
          </Button>
        </div>

        <Suspense fallback={<DestinationsLoading />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((destination) => (
              <DestinationCard key={destination.placeId} destination={destination} />
            ))}
          </div>
        </Suspense>
      </div>
    </main>
  )
}
