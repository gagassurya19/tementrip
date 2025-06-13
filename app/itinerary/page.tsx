"use client"

import type React from "react"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Bot, Loader2 } from "lucide-react"
import { LeafletRouteMap } from "@/components/leaflet-route-map"
import { useState } from "react"
import { destinations } from "@/lib/data"
import { useUser } from "@/contexts/user-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ItineraryGenerator() {
  const { user } = useUser()
  const [selectedDestinations, setSelectedDestinations] = useState<any[]>([])
  const [showMap, setShowMap] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("manual")

  // AI Itinerary state
  const [destination, setDestination] = useState("")
  const [days, setDays] = useState("3")
  const [interests, setInterests] = useState<string[]>(user?.preferences?.interests || [])
  const [budget, setBudget] = useState(user?.preferences?.budget || "medium")
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiItinerary, setAiItinerary] = useState("")

  const handleGenerateItinerary = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would call the API to generate an itinerary
    // For demo purposes, we'll just select a few random destinations
    const randomDestinations = destinations.sort(() => 0.5 - Math.random()).slice(0, 3)

    setSelectedDestinations(randomDestinations)
    setShowMap(true)
  }

  const handleAIItineraryGeneration = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!destination) return

    setIsGenerating(true)
    setAiItinerary("")

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generateItinerary",
          params: {
            destination,
            days: Number.parseInt(days),
            interests,
            budget,
          },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setAiItinerary(data.result)
      } else if (response.status === 503 && (data.isServiceUnavailable || data.isOverloaded)) {
        setAiItinerary(data.message || "All AI models are currently overloaded. Please try again in a few minutes.")
      } else {
        setAiItinerary(data.message || "Sorry, I couldn't generate an itinerary. Please try again.")
      }
    } catch (error) {
      setAiItinerary("An error occurred. Please try again later.")
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleInterest = (interest: string) => {
    setInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]))
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Create Your Itinerary</h1>

        <Tabs defaultValue="manual" onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="manual">Manual Planning</TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-1">
              <Bot className="h-3 w-3" />
              AI Generated
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <div className="sticky top-4">
                  <Card>
                  <CardHeader>
                    <CardTitle>Trip Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-6" onSubmit={handleGenerateItinerary}>
                      <div className="space-y-2">
                        <Label htmlFor="destination">Destination</Label>
                        <Input id="destination" placeholder="Enter city or region" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dates">Travel Dates</Label>
                        <div className="flex items-center">
                          <Input id="dates" placeholder="Select dates" />
                          <Button variant="ghost" size="icon" className="ml-2" type="button">
                            <Calendar className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="trip-type">Trip Type</Label>
                        <Select>
                          <SelectTrigger id="trip-type">
                            <SelectValue placeholder="Select trip type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="solo">Solo Trip</SelectItem>
                            <SelectItem value="couple">Couple</SelectItem>
                            <SelectItem value="family">Family</SelectItem>
                            <SelectItem value="friends">Friends</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="interests">Interests</Label>
                        <Select>
                          <SelectTrigger id="interests">
                            <SelectValue placeholder="Select interests" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nature">Nature</SelectItem>
                            <SelectItem value="culture">Culture</SelectItem>
                            <SelectItem value="food">Food & Culinary</SelectItem>
                            <SelectItem value="adventure">Adventure</SelectItem>
                            <SelectItem value="relaxation">Relaxation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button type="submit" className="w-full">
                        Generate Itinerary
                      </Button>
                    </form>
                  </CardContent>
                </Card>
                </div>
              </div>

              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Itinerary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!showMap ? (
                      <div className="text-center py-12">
                        <h3 className="text-xl font-medium mb-2">No itinerary generated yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Fill in your trip details and click "Generate Itinerary" to get started
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="h-[400px]">
                          <LeafletRouteMap
                            locations={selectedDestinations.map((dest) => ({
                              lat: dest.location.lat,
                              lng: dest.location.lng,
                              title: dest.title,
                              placeId: dest.placeId,
                            }))}
                            showRoute={true}
                            zoom={8}
                          />
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-xl font-medium">Itinerary Overview</h3>
                          {selectedDestinations.map((dest, index) => (
                            <Card key={dest.placeId}>
                              <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                  <div className="bg-blue-100 text-blue-600 font-bold rounded-full w-8 h-8 flex items-center justify-center">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{dest.title}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {dest.city}, {dest.state}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <div className="sticky top-4">
                  <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-blue-500" />
                      AI Itinerary Generator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-6" onSubmit={handleAIItineraryGeneration}>
                      <div className="space-y-2">
                        <Label htmlFor="ai-destination">Destination</Label>
                        <Input
                          id="ai-destination"
                          placeholder="E.g., Bali, Indonesia"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          disabled={isGenerating}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ai-days">Number of Days</Label>
                        <Select value={days} onValueChange={setDays} disabled={isGenerating}>
                          <SelectTrigger id="ai-days">
                            <SelectValue placeholder="Select days" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 10, 14].map((d) => (
                              <SelectItem key={d} value={d.toString()}>
                                {d} {d === 1 ? "day" : "days"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ai-budget">Budget</Label>
                        <Select value={budget} onValueChange={setBudget} disabled={isGenerating}>
                          <SelectTrigger id="ai-budget">
                            <SelectValue placeholder="Select budget" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="budget">Budget</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="luxury">Luxury</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Interests</Label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "nature",
                            "culture",
                            "food",
                            "adventure",
                            "relaxation",
                            "history",
                            "shopping",
                            "nightlife",
                          ].map((interest) => (
                            <Button
                              key={interest}
                              type="button"
                              variant={interests.includes(interest) ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleInterest(interest)}
                              disabled={isGenerating}
                              className="capitalize"
                            >
                              {interest}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <Button type="submit" disabled={isGenerating || !destination} className="w-full">
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Itinerary...
                          </>
                        ) : (
                          "Generate AI Itinerary"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
                </div>
              </div>

              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Generated Itinerary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!aiItinerary && !isGenerating ? (
                      <div className="text-center py-12">
                        <Bot className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-medium mb-2">No AI itinerary generated yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Fill in your destination details and click "Generate AI Itinerary" to get started
                        </p>
                      </div>
                    ) : isGenerating ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                        <p className="text-lg font-medium">Generating your personalized itinerary...</p>
                        <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
                      </div>
                    ) : (
                      <div className="prose max-w-none">
                        <div className="whitespace-pre-line">{aiItinerary}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
