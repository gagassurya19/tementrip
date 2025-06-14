"use client"

import type React from "react"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Bot, Loader2, MapPin, Clock, Users, Heart } from "lucide-react"
import { LeafletRouteMap } from "@/components/leaflet-route-map"
import { useState } from "react"
import { destinations } from "@/lib/data"
import { useUser } from "@/contexts/user-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

export default function ItineraryGenerator() {
  const { user } = useUser()
  const [selectedDestinations, setSelectedDestinations] = useState<any[]>([])
  const [showMap, setShowMap] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("manual")

  // Manual Itinerary state
  const [manualForm, setManualForm] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    tripType: user?.preferences?.tripType || "",
    interests: user?.preferences?.interests || [],
    duration: "3"
  })

  // AI Itinerary state
  const [destination, setDestination] = useState("")
  const [days, setDays] = useState("3")
  const [interests, setInterests] = useState<string[]>(user?.preferences?.interests || [])
  const [budget, setBudget] = useState(user?.preferences?.budget || "medium")
  const [tripType, setTripType] = useState(user?.preferences?.tripType || "")
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiItinerary, setAiItinerary] = useState("")

  const interestOptions = [
    { id: "nature", label: "Alam & Nature", icon: "🌿" },
    { id: "culture", label: "Budaya & Sejarah", icon: "🏛️" },
    { id: "food", label: "Kuliner", icon: "🍜" },
    { id: "adventure", label: "Petualangan", icon: "🏔️" },
    { id: "relaxation", label: "Relaksasi", icon: "🏖️" },
    { id: "shopping", label: "Shopping", icon: "🛍️" },
    { id: "nightlife", label: "Hiburan Malam", icon: "🌃" },
    { id: "photography", label: "Fotografi", icon: "📸" }
  ]

  const handleGenerateItinerary = (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    
    // Simulate generating itinerary by filtering destinations based on interests
    setTimeout(() => {
      const filteredDestinations = destinations
        .filter(dest => {
          if (manualForm.interests.length === 0) return true
          // You can add more sophisticated filtering logic based on destination categories
          return Math.random() > 0.5 // Random for demo
        })
        .sort(() => 0.5 - Math.random())
        .slice(0, parseInt(manualForm.duration))

      setSelectedDestinations(filteredDestinations)
      setShowMap(true)
      setIsGenerating(false)
    }, 2000)
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
            days: parseInt(days),
            interests,
            budget,
            tripType,
          },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setAiItinerary(data.result)
      } else {
        setAiItinerary("Maaf, tidak dapat menggenerate itinerary saat ini. Silakan coba lagi nanti.")
      }
    } catch (error) {
      setAiItinerary("Terjadi kesalahan. Silakan coba lagi nanti.")
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleInterest = (interest: string) => {
    if (activeTab === "manual") {
      setManualForm(prev => ({
        ...prev,
        interests: prev.interests.includes(interest) 
          ? prev.interests.filter(i => i !== interest)
          : [...prev.interests, interest]
      }))
    } else {
      setInterests(prev => 
        prev.includes(interest) 
          ? prev.filter(i => i !== interest)
          : [...prev, interest]
      )
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Buat Itinerary Perjalanan Anda</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Rencanakan perjalanan impian Anda dengan mudah. Pilih destinasi, tentukan preferensi, 
            dan biarkan kami membantu menyusun rencana perjalanan yang sempurna.
          </p>
        </div>

        <Tabs defaultValue="manual" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Manual Planning
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Generated
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Section */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Detail Perjalanan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-6" onSubmit={handleGenerateItinerary}>
                      <div className="space-y-2">
                        <Label htmlFor="destination">Kota Tujuan</Label>
                        <Input 
                          id="destination" 
                          placeholder="Masukkan kota tujuan (mis: Jakarta)" 
                          value={manualForm.destination}
                          onChange={(e) => setManualForm(prev => ({ ...prev, destination: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Tanggal Mulai</Label>
                          <Input 
                            id="startDate" 
                            type="date" 
                            value={manualForm.startDate}
                            onChange={(e) => setManualForm(prev => ({ ...prev, startDate: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate">Tanggal Selesai</Label>
                          <Input 
                            id="endDate" 
                            type="date" 
                            value={manualForm.endDate}
                            onChange={(e) => setManualForm(prev => ({ ...prev, endDate: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="trip-type">Jenis Perjalanan</Label>
                        <Select 
                          value={manualForm.tripType} 
                          onValueChange={(value) => setManualForm(prev => ({ ...prev, tripType: value }))}
                        >
                          <SelectTrigger id="trip-type">
                            <SelectValue placeholder="Pilih jenis perjalanan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="solo">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Solo Trip
                              </div>
                            </SelectItem>
                            <SelectItem value="couple">
                              <div className="flex items-center gap-2">
                                <Heart className="h-4 w-4" />
                                Couple
                              </div>
                            </SelectItem>
                            <SelectItem value="family">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Family
                              </div>
                            </SelectItem>
                            <SelectItem value="friends">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Friends
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration">Durasi (hari)</Label>
                        <Select 
                          value={manualForm.duration} 
                          onValueChange={(value) => setManualForm(prev => ({ ...prev, duration: value }))}
                        >
                          <SelectTrigger id="duration">
                            <SelectValue placeholder="Pilih durasi" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Hari</SelectItem>
                            <SelectItem value="2">2 Hari</SelectItem>
                            <SelectItem value="3">3 Hari</SelectItem>
                            <SelectItem value="4">4 Hari</SelectItem>
                            <SelectItem value="5">5 Hari</SelectItem>
                            <SelectItem value="7">1 Minggu</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label>Kategori Destinasi</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {interestOptions.map((interest) => (
                            <div 
                              key={interest.id} 
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                manualForm.interests.includes(interest.id)
                                  ? 'border-primary bg-primary/10' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => toggleInterest(interest.id)}
                            >
                              <div className="text-center">
                                <div className="text-2xl mb-1">{interest.icon}</div>
                                <div className="text-xs font-medium">{interest.label}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={isGenerating}>
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Menyusun Itinerary...
                          </>
                        ) : (
                          "Generate Itinerary"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Results Section */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Itinerary Anda</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!showMap ? (
                      <div className="text-center py-16">
                        <div className="text-6xl mb-4">🗺️</div>
                        <h3 className="text-xl font-medium mb-2">Belum ada itinerary</h3>
                        <p className="text-muted-foreground mb-4">
                          Isi detail perjalanan Anda dan klik "Generate Itinerary" untuk memulai
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Map */}
                        <div className="h-[400px] rounded-lg overflow-hidden">
                          <LeafletRouteMap
                            locations={selectedDestinations.map((dest) => ({
                              lat: dest.location.lat,
                              lng: dest.location.lng,
                              title: dest.title,
                              placeId: dest.placeId,
                            }))}
                            showRoute={true}
                            zoom={10}
                          />
                        </div>

                        {/* Itinerary Details */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-medium">Rencana Perjalanan</h3>
                            <div className="flex gap-2">
                              <Badge variant="secondary">
                                <Clock className="h-3 w-3 mr-1" />
                                {manualForm.duration} Hari
                              </Badge>
                              <Badge variant="secondary">
                                <MapPin className="h-3 w-3 mr-1" />
                                {selectedDestinations.length} Destinasi
                              </Badge>
                            </div>
                          </div>

                          {selectedDestinations.map((dest, index) => (
                            <Card key={dest.placeId} className="overflow-hidden">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                  <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-lg mb-1">{dest.title}</h4>
                                    <p className="text-muted-foreground mb-2">
                                      {dest.city}, {dest.state}
                                    </p>
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                      {dest.description}
                                    </p>
                                    <div className="flex items-center gap-4 mt-3">
                                      <Badge variant="outline">
                                        ⭐ {dest.totalScore}
                                      </Badge>
                                      <Badge variant="outline">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {dest.tripDuration} hari
                                      </Badge>
                                    </div>
                                  </div>
                                  <Button variant="outline" size="sm">
                                    Lihat Detail
                                  </Button>
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

          <TabsContent value="ai" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* AI Form Section */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      AI Itinerary Generator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-6" onSubmit={handleAIItineraryGeneration}>
                      <div className="space-y-2">
                        <Label htmlFor="ai-destination">Destinasi</Label>
                        <Input
                          id="ai-destination"
                          placeholder="Masukkan kota tujuan"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ai-days">Durasi Perjalanan</Label>
                        <Select value={days} onValueChange={setDays}>
                          <SelectTrigger id="ai-days">
                            <SelectValue placeholder="Pilih durasi" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Hari</SelectItem>
                            <SelectItem value="2">2 Hari</SelectItem>
                            <SelectItem value="3">3 Hari</SelectItem>
                            <SelectItem value="4">4 Hari</SelectItem>
                            <SelectItem value="5">5 Hari</SelectItem>
                            <SelectItem value="7">1 Minggu</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ai-trip-type">Jenis Perjalanan</Label>
                        <Select value={tripType} onValueChange={setTripType}>
                          <SelectTrigger id="ai-trip-type">
                            <SelectValue placeholder="Pilih jenis perjalanan" />
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
                        <Label htmlFor="ai-budget">Budget</Label>
                        <Select value={budget} onValueChange={setBudget}>
                          <SelectTrigger id="ai-budget">
                            <SelectValue placeholder="Pilih budget" />
                          </SelectTrigger>
                          <SelectContent>
                                                         <SelectItem value="low">Hemat (&lt; 500rb/hari)</SelectItem>
                             <SelectItem value="medium">Sedang (500rb - 1jt/hari)</SelectItem>
                             <SelectItem value="high">Premium (&gt; 1jt/hari)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label>Minat & Preferensi</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {interestOptions.map((interest) => (
                            <div 
                              key={interest.id} 
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                interests.includes(interest.id)
                                  ? 'border-primary bg-primary/10' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => toggleInterest(interest.id)}
                            >
                              <div className="text-center">
                                <div className="text-2xl mb-1">{interest.icon}</div>
                                <div className="text-xs font-medium">{interest.label}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={isGenerating}>
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Menggenerate dengan AI...
                          </>
                        ) : (
                          <>
                            <Bot className="mr-2 h-4 w-4" />
                            Generate dengan AI
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* AI Results Section */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      AI Generated Itinerary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!aiItinerary && !isGenerating ? (
                      <div className="text-center py-16">
                        <div className="text-6xl mb-4">🤖</div>
                        <h3 className="text-xl font-medium mb-2">AI siap membantu Anda</h3>
                        <p className="text-muted-foreground mb-4">
                          Isi preferensi perjalanan Anda dan biarkan AI menyusun itinerary yang sempurna
                        </p>
                      </div>
                    ) : (
                      <div className="prose max-w-none">
                        {isGenerating ? (
                          <div className="text-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                            <p>AI sedang menyusun itinerary terbaik untuk Anda...</p>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {aiItinerary}
                          </div>
                        )}
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
