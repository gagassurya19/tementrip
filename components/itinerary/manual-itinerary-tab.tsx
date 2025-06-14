"use client"

import type React from "react"
import { useState, useMemo, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Loader2, MapPin, Clock, Users, Heart, Save, BookmarkCheck, X } from "lucide-react"
import { LeafletRouteMap } from "@/components/leaflet-route-map"
import { destinations } from "@/lib/data"
import { useUser } from "@/contexts/user-context"
import { Badge } from "@/components/ui/badge"
import { interestOptions } from "@/lib/constants/interests"
import type { ManualItineraryForm, SavedItinerary } from "@/types/itinerary"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

interface ManualItineraryTabProps {
  onSaveItinerary: (itinerary: SavedItinerary) => void
}

export default function ManualItineraryTab({ onSaveItinerary }: ManualItineraryTabProps) {
  const { user, bookmarks, isAuthenticated } = useUser()
  const [selectedDestinations, setSelectedDestinations] = useState<any[]>([])
  const [showMap, setShowMap] = useState(false)
  const [showRoute, setShowRoute] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [includeWishlist, setIncludeWishlist] = useState(false)
  const [selectedWishlistItems, setSelectedWishlistItems] = useState<string[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  const [manualForm, setManualForm] = useState<ManualItineraryForm>({
    destination: "",
    startDate: "",
    endDate: "",
    tripType: "",
    interests: [],
    budget: "medium",
    duration: "3",
  })

  // Initialize form with user preferences only once
  useEffect(() => {
    if (user && !isInitialized) {
      setManualForm(prev => ({
        ...prev,
        tripType: user.preferences?.tripType || prev.tripType,
        interests: user.preferences?.interests || prev.interests,
        budget: user.preferences?.budget || prev.budget,
      }))
      setIsInitialized(true)
    }
  }, [user, isInitialized])

  const handleGenerateItinerary = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    
    // Simulate generating itinerary by filtering destinations based on interests
    setTimeout(() => {
      let filteredDestinations = destinations
        .filter(dest => {
          if (manualForm.interests.length === 0) return true
          // You can add more sophisticated filtering logic based on destination categories
          return Math.random() > 0.5 // Random for demo
        })
        .sort(() => 0.5 - Math.random())

      // Add selected wishlist destinations if user opted to include them
      if (includeWishlist && selectedWishlistItems.length > 0) {
        const wishlistDestinations = destinations.filter(dest => 
          selectedWishlistItems.includes(dest.placeId)
        )
        
        // Prioritize wishlist destinations by putting them first
        filteredDestinations = [
          ...wishlistDestinations,
          ...filteredDestinations.filter(dest => !selectedWishlistItems.includes(dest.placeId))
        ]
      }

      // Limit to requested duration
      filteredDestinations = filteredDestinations.slice(0, parseInt(manualForm.duration))

      setSelectedDestinations(filteredDestinations)
      setShowMap(true)
      setIsGenerating(false)
    }, 2000)
  }, [manualForm.interests, manualForm.duration, includeWishlist, selectedWishlistItems])

  const saveManualItinerary = useCallback(() => {
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

    onSaveItinerary(newItinerary)
    alert('Itinerary berhasil disimpan!')
  }, [selectedDestinations, manualForm, onSaveItinerary])

  const toggleInterest = useCallback((interest: string) => {
    setManualForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest) 
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }, [])

  const toggleWishlistItem = useCallback((placeId: string) => {
    setSelectedWishlistItems(prev => 
      prev.includes(placeId)
        ? prev.filter(id => id !== placeId)
        : [...prev, placeId]
    )
  }, [])

  const removeWishlistItem = useCallback((placeId: string) => {
    setSelectedWishlistItems(prev => prev.filter(id => id !== placeId))
  }, [])

  // Memoize the relevant wishlist calculation to prevent unnecessary recalculations
  const relevantWishlist = useMemo(() => {
    if (!manualForm.destination) return bookmarks
    
    return bookmarks.filter(bookmark => 
      bookmark.city.toLowerCase().includes(manualForm.destination.toLowerCase()) ||
      bookmark.state.toLowerCase().includes(manualForm.destination.toLowerCase())
    )
  }, [bookmarks, manualForm.destination])

  return (
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

              <div className="space-y-2">
                <Label htmlFor="manual-budget">Budget</Label>
                <Select value={manualForm.budget} onValueChange={(value) => setManualForm(prev => ({ ...prev, budget: value }))}>
                  <SelectTrigger id="manual-budget">
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

              {/* Wishlist Integration Section */}
              {isAuthenticated && bookmarks.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="include-wishlist"
                        checked={includeWishlist}
                        onChange={(e) => {
                          setIncludeWishlist(e.target.checked)
                          if (!e.target.checked) {
                            setSelectedWishlistItems([])
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="include-wishlist" className="flex items-center gap-2">
                        <BookmarkCheck className="h-4 w-4" />
                        Sertakan destinasi dari wishlist
                      </Label>
                    </div>

                    {includeWishlist && (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          {relevantWishlist.length > 0 ? (
                            manualForm.destination ? 
                              `Pilih destinasi wishlist di ${manualForm.destination}:` :
                              "Pilih destinasi dari wishlist Anda:"
                          ) : (
                            manualForm.destination ? 
                              `Tidak ada destinasi wishlist di ${manualForm.destination}` :
                              "Pilih kota tujuan untuk melihat wishlist yang relevan"
                          )}
                        </div>

                        {/* Selected Wishlist Items */}
                        {selectedWishlistItems.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-primary">
                              Terpilih ({selectedWishlistItems.length}):
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {selectedWishlistItems.map(placeId => {
                                const bookmark = bookmarks.find(b => b.placeId === placeId)
                                if (!bookmark) return null
                                return (
                                  <Badge 
                                    key={placeId} 
                                    variant="secondary" 
                                    className="text-xs flex items-center gap-1"
                                  >
                                    {bookmark.title}
                                    <button
                                      type="button"
                                      onClick={() => removeWishlistItem(placeId)}
                                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                                    >
                                      <X className="h-2.5 w-2.5" />
                                    </button>
                                  </Badge>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Wishlist Items Selection */}
                        {relevantWishlist.length > 0 && (
                          <div className="max-h-32 overflow-y-auto space-y-2 border rounded-lg p-2">
                            {relevantWishlist.map((bookmark) => {
                              const isSelected = selectedWishlistItems.includes(bookmark.placeId)
                              return (
                                <div 
                                  key={bookmark.id}
                                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                                    isSelected
                                      ? 'bg-primary/10 border border-primary/20'
                                      : 'hover:bg-gray-50 border border-transparent'
                                  }`}
                                  onClick={() => toggleWishlistItem(bookmark.placeId)}
                                >
                                  <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0">
                                    <Image
                                      src={bookmark.imageUrl || "/placeholder.svg"}
                                      alt={bookmark.title}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">
                                      {bookmark.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {bookmark.city}
                                    </div>
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}} // Handled by parent click
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary pointer-events-none"
                                  />
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

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
                {isAuthenticated && bookmarks.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    💡 Tip: Centang "Sertakan destinasi dari wishlist" untuk menambahkan tempat favorit Anda
                  </p>
                )}
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
                    {selectedWishlistItems.length > 0 && (
                      <Badge variant="outline" className="flex items-center gap-1 bg-primary/10">
                        <BookmarkCheck className="h-3 w-3" />
                        {selectedWishlistItems.filter(id => selectedDestinations.some(d => d.placeId === id)).length} dari Wishlist
                      </Badge>
                    )}
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
                      {selectedWishlistItems.includes(selectedDestinations[0].placeId) && (
                        <Badge variant="outline" className="text-xs bg-primary/10">
                          <BookmarkCheck className="h-2.5 w-2.5 mr-1" />
                          Wishlist
                        </Badge>
                      )}
                    </div>
                    {selectedDestinations.slice(1, -1).map((dest, index) => (
                      <div key={dest.placeId} className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-blue-700">Stop {index + 1}: {dest.title}</span>
                        {selectedWishlistItems.includes(dest.placeId) && (
                          <Badge variant="outline" className="text-xs bg-primary/10">
                            <BookmarkCheck className="h-2.5 w-2.5 mr-1" />
                            Wishlist
                          </Badge>
                        )}
                      </div>
                    ))}
                    {selectedDestinations.length > 1 && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium text-red-700">End: {selectedDestinations[selectedDestinations.length - 1].title}</span>
                        {selectedWishlistItems.includes(selectedDestinations[selectedDestinations.length - 1].placeId) && (
                          <Badge variant="outline" className="text-xs bg-primary/10">
                            <BookmarkCheck className="h-2.5 w-2.5 mr-1" />
                            Wishlist
                          </Badge>
                        )}
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
                              {selectedWishlistItems.includes(dest.placeId) && (
                                <Badge variant="outline" className="text-xs bg-primary/10">
                                  <BookmarkCheck className="h-3 w-3 mr-1" />
                                  Wishlist
                                </Badge>
                              )}
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
                          {selectedWishlistItems.length > 0 && (
                            <li>• ❤️ Beberapa destinasi dipilih dari wishlist Anda untuk pengalaman yang lebih personal</li>
                          )}
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
  )
} 