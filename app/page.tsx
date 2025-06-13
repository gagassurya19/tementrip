import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { DestinationCard } from "@/components/destination-card"
import { destinations } from "@/lib/data"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <section className="py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Your next adventure starts here</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Smart travel suggestions you can save and turn into a full itinerary
        </p>

        <div className="flex max-w-md mx-auto relative">
          <Input type="text" placeholder="search for a destination" className="pr-12 rounded-r-none h-12" />
          <Button size="icon" className="h-12 w-12 rounded-l-none">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </section>

      <section className="py-16 px-4 max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-12">Top Destinations</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((destination) => (
            <DestinationCard key={destination.placeId} destination={destination} />
          ))}
        </div>
      </section>
    </main>
  )
}
