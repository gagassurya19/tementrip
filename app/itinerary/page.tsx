"use client"

import type React from "react"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Bot, Loader2, MapPin, Clock, Users, Heart, Save, History, Trash2, Edit } from "lucide-react"
import { LeafletRouteMap } from "@/components/leaflet-route-map"
import { useState, useEffect } from "react"
import { destinations } from "@/lib/data"
import { useUser } from "@/contexts/user-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

interface SavedItinerary {
  id: string
  title: string
  type: 'manual' | 'ai'
  destination: string
  duration: string
  interests: string[]
  budget: string
  tripType: string
  data: any // For manual: selectedDestinations, for AI: aiItinerary text
  createdAt: string
  startDate?: string
  endDate?: string
}

export default function ItineraryGenerator() {
  const { user } = useUser()
  const [selectedDestinations, setSelectedDestinations] = useState<any[]>([])
  const [showMap, setShowMap] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("manual")
  const [showRoute, setShowRoute] = useState(true)
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([])
  const [selectedHistoryItinerary, setSelectedHistoryItinerary] = useState<SavedItinerary | null>(null)
  const [showHistoryDetail, setShowHistoryDetail] = useState(false)

  // Manual Itinerary state
  const [manualForm, setManualForm] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    tripType: user?.preferences?.tripType || "",
    interests: user?.preferences?.interests || [],
    budget: user?.preferences?.budget || "medium",
    duration: "3",
  })

  // AI Itinerary state
  const [destination, setDestination] = useState("")
  const [days, setDays] = useState("3")
  const [interests, setInterests] = useState<string[]>(user?.preferences?.interests || [])
  const [budget, setBudget] = useState(user?.preferences?.budget || "medium")
  const [tripType, setTripType] = useState(user?.preferences?.tripType || "")
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiItinerary, setAiItinerary] = useState("")

  // Load saved itineraries from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('savedItineraries')
    if (saved) {
      try {
        setSavedItineraries(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading saved itineraries:', error)
      }
    }
  }, [])

  // Save itineraries to localStorage whenever savedItineraries changes
  useEffect(() => {
    localStorage.setItem('savedItineraries', JSON.stringify(savedItineraries))
  }, [savedItineraries])

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

  const saveManualItinerary = () => {
    if (selectedDestinations.length === 0) return

    const newItinerary: SavedItinerary = {
      id: Date.now().toString(),
      title: `Trip ke ${manualForm.destination}`,
      type: 'manual',
      destination: manualForm.destination,
      duration: manualForm.duration,
      interests: manualForm.interests,
      budget: manualForm.budget,
      tripType: manualForm.tripType,
      data: selectedDestinations,
      createdAt: new Date().toISOString(),
      startDate: manualForm.startDate,
      endDate: manualForm.endDate
    }

    setSavedItineraries(prev => [newItinerary, ...prev])
    alert('Itinerary berhasil disimpan!')
  }

  const saveAIItinerary = () => {
    if (!aiItinerary || !destination) return

    const newItinerary: SavedItinerary = {
      id: Date.now().toString(),
      title: `AI Trip ke ${destination}`,
      type: 'ai',
      destination: destination,
      duration: days,
      interests: interests,
      budget: budget,
      tripType: tripType,
      data: aiItinerary,
      createdAt: new Date().toISOString()
    }

    setSavedItineraries(prev => [newItinerary, ...prev])
    alert('Itinerary berhasil disimpan!')
  }

  const deleteItinerary = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus itinerary ini?')) {
      setSavedItineraries(prev => prev.filter(item => item.id !== id))
    }
  }

  const loadSavedItinerary = (itinerary: SavedItinerary) => {
    setSelectedHistoryItinerary(itinerary)
    setShowHistoryDetail(true)
  }

  const editSavedItinerary = (itinerary: SavedItinerary) => {
    if (itinerary.type === 'manual') {
      setManualForm({
        destination: itinerary.destination,
        startDate: itinerary.startDate || "",
        endDate: itinerary.endDate || "",
        tripType: itinerary.tripType,
        interests: itinerary.interests,
        budget: itinerary.budget,
        duration: itinerary.duration,
      })
      setSelectedDestinations(itinerary.data)
      setShowMap(true)
      setActiveTab('manual')
    } else {
      setDestination(itinerary.destination)
      setDays(itinerary.duration)
      setInterests(itinerary.interests)
      setBudget(itinerary.budget)
      setTripType(itinerary.tripType)
      setAiItinerary(itinerary.data)
      setActiveTab('ai')
    }
  }

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
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Manual Planning
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Generated
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History ({savedItineraries.length})
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

                      {/* Budget */}
                      <div className="space-y-2">
                        <Label htmlFor="ai-budget">Budget</Label>
                        <Select value={manualForm.budget} onValueChange={(value) => setManualForm(prev => ({ ...prev, budget: value }))}>
                          <SelectTrigger id="ai-budget">
                            <SelectValue placeholder="Pilih budget" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="budget">Hemat (&lt; 500rb/hari)</SelectItem>
                            <SelectItem value="medium">Sedang (500rb - 1jt/hari)</SelectItem>
                            <SelectItem value="luxury">Premium (&gt; 1jt/hari)</SelectItem>
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
                    <div className="flex items-center justify-between">
                      <CardTitle>Itinerary Anda</CardTitle>
                      {showMap && selectedDestinations.length > 0 && (
                        <Button onClick={saveManualItinerary} className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          Simpan Itinerary
                        </Button>
                      )}
                    </div>
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
                        {/* Map Controls */}
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-medium">Peta Rute Perjalanan</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {selectedDestinations.length} Lokasi
                            </Badge>
                            <Button
                              variant={showRoute ? "default" : "outline"}
                              size="sm"
                              onClick={() => setShowRoute(!showRoute)}
                              className="flex items-center gap-1"
                            >
                              {showRoute ? "🗺️ Rute ON" : "📍 Marker Only"}
                            </Button>
                          </div>
                        </div>

                        {/* Enhanced Map */}
                        <div className="h-[450px] rounded-lg overflow-hidden border shadow-sm">
                          <LeafletRouteMap
                            locations={selectedDestinations.map((dest, index) => ({
                              lat: dest.location.lat,
                              lng: dest.location.lng,
                              title: dest.title,
                              placeId: dest.placeId,
                              description: dest.description || `${dest.city}, ${dest.state} - Destinasi ${index + 1}`,
                            }))}
                            showRoute={showRoute}
                            zoom={selectedDestinations.length === 1 ? 12 : 10}
                            center={selectedDestinations.length > 0 ? {
                              lat: selectedDestinations[0].location.lat,
                              lng: selectedDestinations[0].location.lng
                            } : undefined}
                          />
                        </div>

                        {/* Route Information */}
                        {showRoute && selectedDestinations.length > 1 && (
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium text-green-700">Start: {selectedDestinations[0].title}</span>
                            </div>
                            {selectedDestinations.slice(1, -1).map((dest, index) => (
                              <div key={dest.placeId} className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="text-sm font-medium text-blue-700">Stop {index + 1}: {dest.title}</span>
                              </div>
                            ))}
                            {selectedDestinations.length > 1 && (
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-sm font-medium text-red-700">End: {selectedDestinations[selectedDestinations.length - 1].title}</span>
                              </div>
                            )}
                          </div>
                        )}

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
                            <Card key={dest.placeId} className="overflow-hidden hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                                    index === 0 ? 'bg-green-500' : 
                                    index === selectedDestinations.length - 1 ? 'bg-red-500' : 
                                    'bg-blue-500'
                                  }`}>
                                    {index === 0 ? '🚩' : index === selectedDestinations.length - 1 ? '🏁' : index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold text-lg">{dest.title}</h4>
                                      {index === 0 && <Badge variant="outline" className="text-xs">START</Badge>}
                                      {index === selectedDestinations.length - 1 && <Badge variant="outline" className="text-xs">END</Badge>}
                                    </div>
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
                                      <Badge variant="outline" className="text-xs">
                                        Day {Math.ceil((index + 1) * (parseInt(manualForm.duration) / selectedDestinations.length))}
                                      </Badge>
                                    </div>
                                  </div>
                                  <Button variant="outline" size="sm" className="shrink-0">
                                    Lihat Detail
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}

                          {/* Travel Tips */}
                          {selectedDestinations.length > 1 && (
                            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                              <CardContent className="p-4">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  💡 Tips Perjalanan
                                </h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  <li>• Mulai perjalanan dari {selectedDestinations[0].title} sebagai titik start</li>
                                  <li>• Rute telah dioptimalkan untuk efisiensi waktu dan jarak</li>
                                  <li>• Siapkan waktu tambahan untuk perjalanan antar destinasi</li>
                                  <li>• Cek kondisi lalu lintas sebelum berangkat</li>
                                </ul>
                              </CardContent>
                            </Card>
                          )}
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
                            <SelectItem value="budget">Hemat (&lt; 500rb/hari)</SelectItem>
                            <SelectItem value="medium">Sedang (500rb - 1jt/hari)</SelectItem>
                            <SelectItem value="luxury">Premium (&gt; 1jt/hari)</SelectItem>
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
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        AI Generated Itinerary
                      </CardTitle>
                      {aiItinerary && !isGenerating && (
                        <Button onClick={saveAIItinerary} className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          Simpan Itinerary
                        </Button>
                      )}
                    </div>
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

          <TabsContent value="history" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* History List Section */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        History ({savedItineraries.length})
                      </CardTitle>
                      {showHistoryDetail && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowHistoryDetail(false)
                            setSelectedHistoryItinerary(null)
                          }}
                          className="text-xs"
                        >
                          Tutup
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="max-h-[600px] overflow-y-auto">
                    {savedItineraries.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">📂</div>
                        <h3 className="font-medium mb-1">Belum ada history</h3>
                        <p className="text-sm text-muted-foreground">
                          Simpan itinerary pertama Anda
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {savedItineraries.map((itinerary) => (
                          <Card 
                            key={itinerary.id} 
                            className={`hover:shadow-md transition-shadow cursor-pointer ${
                              selectedHistoryItinerary?.id === itinerary.id ? 'ring-2 ring-primary' : ''
                            }`}
                            onClick={() => loadSavedItinerary(itinerary)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm line-clamp-1">{itinerary.title}</h4>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Badge 
                                      variant={itinerary.type === 'ai' ? 'default' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {itinerary.type === 'ai' ? (
                                        <>
                                          <Bot className="h-3 w-3 mr-1" />
                                          AI
                                        </>
                                      ) : (
                                        <>
                                          <MapPin className="h-3 w-3 mr-1" />
                                          Manual
                                        </>
                                      )}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {itinerary.duration} hari
                                    </Badge>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteItinerary(itinerary.id)
                                  }}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <div className="space-y-1 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {itinerary.destination}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(itinerary.createdAt).toLocaleDateString('id-ID', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </div>
                              </div>

                              <div className="flex items-center justify-between mt-3">
                                <Badge variant="outline" className="text-xs">
                                  {itinerary.budget === 'budget' ? 'Hemat' : 
                                   itinerary.budget === 'medium' ? 'Sedang' : 'Premium'}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    editSavedItinerary(itinerary)
                                  }}
                                  className="text-xs h-6"
                                >
                                  Edit
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* History Detail Section */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {selectedHistoryItinerary ? selectedHistoryItinerary.title : 'Detail Itinerary'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!showHistoryDetail ? (
                      <div className="text-center py-16">
                        <div className="text-6xl mb-4">📋</div>
                        <h3 className="text-xl font-medium mb-2">Pilih itinerary untuk melihat detail</h3>
                        <p className="text-muted-foreground mb-4">
                          Klik pada salah satu itinerary di samping untuk melihat detail lengkapnya
                        </p>
                      </div>
                    ) : selectedHistoryItinerary ? (
                      <div className="space-y-6">
                        {/* Itinerary Info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Badge 
                              variant={selectedHistoryItinerary.type === 'ai' ? 'default' : 'secondary'}
                              className="text-sm"
                            >
                              {selectedHistoryItinerary.type === 'ai' ? (
                                <>
                                  <Bot className="h-4 w-4 mr-1" />
                                  AI Generated
                                </>
                              ) : (
                                <>
                                  <MapPin className="h-4 w-4 mr-1" />
                                  Manual Planning
                                </>
                              )}
                            </Badge>
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {selectedHistoryItinerary.duration} Hari
                            </Badge>
                            <Badge variant="outline">
                              {selectedHistoryItinerary.budget === 'budget' ? 'Hemat' : 
                               selectedHistoryItinerary.budget === 'medium' ? 'Sedang' : 'Premium'}
                            </Badge>
                          </div>
                        </div>

                        {/* Trip Info */}
                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div>
                            <Label className="text-sm font-medium">Destinasi</Label>
                            <p className="text-sm">{selectedHistoryItinerary.destination}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Jenis Perjalanan</Label>
                            <p className="text-sm capitalize">{selectedHistoryItinerary.tripType}</p>
                          </div>
                          {selectedHistoryItinerary.startDate && selectedHistoryItinerary.endDate && (
                            <>
                              <div>
                                <Label className="text-sm font-medium">Tanggal Mulai</Label>
                                <p className="text-sm">{new Date(selectedHistoryItinerary.startDate).toLocaleDateString('id-ID')}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Tanggal Selesai</Label>
                                <p className="text-sm">{new Date(selectedHistoryItinerary.endDate).toLocaleDateString('id-ID')}</p>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Interests */}
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Minat & Preferensi</Label>
                          <div className="flex flex-wrap gap-2">
                            {selectedHistoryItinerary.interests.map((interest) => {
                              const interestOption = interestOptions.find(opt => opt.id === interest)
                              return (
                                <Badge key={interest} variant="outline">
                                  {interestOption?.icon} {interestOption?.label}
                                </Badge>
                              )
                            })}
                          </div>
                        </div>

                        {/* Content based on type */}
                        {selectedHistoryItinerary.type === 'manual' ? (
                          <div className="space-y-6">
                            {/* Map Controls */}
                            <div className="flex items-center justify-between">
                              <h3 className="text-xl font-medium">Peta Rute Perjalanan</h3>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {selectedHistoryItinerary.data.length} Lokasi
                                </Badge>
                                <Button
                                  variant={showRoute ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setShowRoute(!showRoute)}
                                  className="flex items-center gap-1"
                                >
                                  {showRoute ? "🗺️ Rute ON" : "📍 Marker Only"}
                                </Button>
                              </div>
                            </div>

                            {/* Enhanced Map */}
                            <div className="h-[450px] rounded-lg overflow-hidden border shadow-sm">
                              <LeafletRouteMap
                                locations={selectedHistoryItinerary.data.map((dest: any, index: number) => ({
                                  lat: dest.location.lat,
                                  lng: dest.location.lng,
                                  title: dest.title,
                                  placeId: dest.placeId,
                                  description: dest.description || `${dest.city}, ${dest.state} - Destinasi ${index + 1}`,
                                }))}
                                showRoute={showRoute}
                                zoom={selectedHistoryItinerary.data.length === 1 ? 12 : 10}
                                center={selectedHistoryItinerary.data.length > 0 ? {
                                  lat: selectedHistoryItinerary.data[0].location.lat,
                                  lng: selectedHistoryItinerary.data[0].location.lng
                                } : undefined}
                              />
                            </div>

                            {/* Route Information */}
                            {showRoute && selectedHistoryItinerary.data.length > 1 && (
                              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  <span className="text-sm font-medium text-green-700">Start: {selectedHistoryItinerary.data[0].title}</span>
                                </div>
                                {selectedHistoryItinerary.data.slice(1, -1).map((dest: any, index: number) => (
                                  <div key={dest.placeId} className="flex items-center gap-2 mb-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-blue-700">Stop {index + 1}: {dest.title}</span>
                                  </div>
                                ))}
                                {selectedHistoryItinerary.data.length > 1 && (
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-red-700">End: {selectedHistoryItinerary.data[selectedHistoryItinerary.data.length - 1].title}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Itinerary Details */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h3 className="text-xl font-medium">Rencana Perjalanan</h3>
                                <div className="flex gap-2">
                                  <Badge variant="secondary">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {selectedHistoryItinerary.duration} Hari
                                  </Badge>
                                  <Badge variant="secondary">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {selectedHistoryItinerary.data.length} Destinasi
                                  </Badge>
                                </div>
                              </div>

                              {selectedHistoryItinerary.data.map((dest: any, index: number) => (
                                <Card key={dest.placeId} className="overflow-hidden hover:shadow-md transition-shadow">
                                  <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                                        index === 0 ? 'bg-green-500' : 
                                        index === selectedHistoryItinerary.data.length - 1 ? 'bg-red-500' : 
                                        'bg-blue-500'
                                      }`}>
                                        {index === 0 ? '🚩' : index === selectedHistoryItinerary.data.length - 1 ? '🏁' : index + 1}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h4 className="font-semibold text-lg">{dest.title}</h4>
                                          {index === 0 && <Badge variant="outline" className="text-xs">START</Badge>}
                                          {index === selectedHistoryItinerary.data.length - 1 && <Badge variant="outline" className="text-xs">END</Badge>}
                                        </div>
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
                                          <Badge variant="outline" className="text-xs">
                                            Day {Math.ceil((index + 1) * (parseInt(selectedHistoryItinerary.duration) / selectedHistoryItinerary.data.length))}
                                          </Badge>
                                        </div>
                                      </div>
                                      <Button variant="outline" size="sm" className="shrink-0">
                                        Lihat Detail
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}

                              {/* Travel Tips */}
                              {selectedHistoryItinerary.data.length > 1 && (
                                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                                  <CardContent className="p-4">
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                      💡 Tips Perjalanan
                                    </h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                      <li>• Mulai perjalanan dari {selectedHistoryItinerary.data[0].title} sebagai titik start</li>
                                      <li>• Rute telah dioptimalkan untuk efisiensi waktu dan jarak</li>
                                      <li>• Siapkan waktu tambahan untuk perjalanan antar destinasi</li>
                                      <li>• Cek kondisi lalu lintas sebelum berangkat</li>
                                    </ul>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          </div>
                        ) : (
                          // AI Itinerary Content
                          <div className="space-y-4">
                            <h3 className="text-xl font-medium">AI Generated Itinerary</h3>
                            <div className="prose max-w-none">
                              <div className="whitespace-pre-wrap text-sm leading-relaxed bg-gray-50 p-4 rounded-lg">
                                {selectedHistoryItinerary.data}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
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
