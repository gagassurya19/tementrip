"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { DestinationCard } from "@/components/destination-card"
import { destinations } from "@/lib/data"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/destinations?search=${encodeURIComponent(searchTerm.trim())}`)
    } else {
      router.push('/destinations')
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <section className="py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Your next adventure starts here</h1>
        <p className="text-3xl text-muted-foreground mb-8 mx-auto">
          Smart travel suggestions you can save and turn into a full itinerary
        </p>

        <form onSubmit={handleSearch} className="flex max-w-md mx-auto relative pt-10">
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
      </section>

      <section className="py-16 px-4 max-w-7xl mx-auto w-full">
        <div className="flex justify-center mb-24">
          <h2 
            className="font-bold text-center capitalize"
            style={{
              fontFamily: 'Inter',
              fontWeight: 700,
              fontSize: '50px',
              lineHeight: '100%',
              letterSpacing: '0%',
              textAlign: 'center',
              textTransform: 'capitalize'
            }}
          >
            Top Destinations
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.slice(0, 4).map((destination) => (
            <DestinationCard key={destination.placeId} destination={destination} />
          ))}
        </div>
      </section>
    </main>
  )
}
