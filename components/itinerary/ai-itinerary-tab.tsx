"use client"

import type React from "react"
import { useState, useMemo, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bot, Loader2, Save, BookmarkCheck, X } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { interestOptions } from "@/lib/constants/interests"
import type { SavedItinerary } from "@/types/itinerary"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Calendar, Clock, MapPin, DollarSign, Lightbulb } from "lucide-react"

interface AIItineraryTabProps {
  onSaveItinerary: (itinerary: SavedItinerary) => void
}

export default function AIItineraryTab({ onSaveItinerary }: AIItineraryTabProps) {
  const { user, bookmarks, isAuthenticated } = useUser()
  const [destination, setDestination] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [days, setDays] = useState("3")
  const [interests, setInterests] = useState<string[]>([])
  const [budget, setBudget] = useState("medium")
  const [tripType, setTripType] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiItinerary, setAiItinerary] = useState("")
  const [includeWishlist, setIncludeWishlist] = useState(false)
  const [selectedWishlistItems, setSelectedWishlistItems] = useState<string[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize form with user preferences only once
  useEffect(() => {
    if (user && !isInitialized) {
      setInterests(user.preferences?.interests || [])
      setBudget(user.preferences?.budget || "medium")
      setTripType(user.preferences?.tripType || "")
      setIsInitialized(true)
    }
  }, [user, isInitialized])

  const handleAIItineraryGeneration = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!destination) return

    setIsGenerating(true)
    setAiItinerary("")

    try {
      // Prepare wishlist context for AI if user opted to include wishlist
      let wishlistContext = ""
      if (includeWishlist && selectedWishlistItems.length > 0) {
        const selectedBookmarks = bookmarks.filter(bookmark => 
          selectedWishlistItems.includes(bookmark.placeId)
        )
        wishlistContext = `\n\nPLEASE PRIORITIZE including these destinations from the user's wishlist:\n${
          selectedBookmarks.map(bookmark => 
            `- ${bookmark.title} (${bookmark.city}, ${bookmark.state})`
          ).join('\n')
        }\nUser specifically wants these places included in their itinerary.`
      }

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
            startDate,
            endDate,
            interests,
            budget,
            tripType,
            wishlistContext, // Add wishlist context for AI
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
  }, [destination, days, startDate, endDate, interests, budget, tripType, includeWishlist, selectedWishlistItems, bookmarks])

  const saveAIItinerary = useCallback(() => {
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
      createdAt: new Date().toISOString(),
      startDate,
      endDate
    }

    onSaveItinerary(newItinerary)
    alert('Itinerary berhasil disimpan!')
  }, [aiItinerary, destination, days, interests, budget, tripType, startDate, endDate, onSaveItinerary])

  const toggleInterest = useCallback((interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
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
    if (!destination) return bookmarks
    
    return bookmarks.filter(bookmark => 
      bookmark.city.toLowerCase().includes(destination.toLowerCase()) ||
      bookmark.state.toLowerCase().includes(destination.toLowerCase())
    )
  }, [bookmarks, destination])

  // Parser function for AI response
  const parseAIItinerary = useCallback((rawItinerary: string) => {
    if (!rawItinerary) return null

    const sections = rawItinerary.split('\n\n')
    const parsedData: {
      overallPlan?: string
      days: Array<{
        title: string
        activities: Array<{
          time: string
          content: string
          budget?: string
          tips?: string
        }>
      }>
    } = { days: [] }

    let currentDay: any = null
    let currentActivity: any = null

    sections.forEach(section => {
      const trimmedSection = section.trim()
      if (!trimmedSection) return

      // Check for Overall Plan
      if (trimmedSection.startsWith('**Overall Plan:**')) {
        parsedData.overallPlan = trimmedSection.replace('**Overall Plan:**', '').trim()
        return
      }

      // Check for day headers
      const dayMatch = trimmedSection.match(/\*\*Hari (\d+):\*\*/i)
      if (dayMatch) {
        if (currentDay) {
          parsedData.days.push(currentDay)
        }
        currentDay = {
          title: `Hari ${dayMatch[1]}`,
          activities: []
        }
        return
      }

      // Check for time-based activities
      const timeMatch = trimmedSection.match(/^(Pagi|Siang|Sore|Malam):\s*(.*)/i)
      if (timeMatch && currentDay) {
        if (currentActivity) {
          currentDay.activities.push(currentActivity)
        }
        
        let content = timeMatch[2]
        let budget = ''
        let tips = ''

        // Extract budget information
        const budgetMatches = content.match(/@budget@:\s*([^@\n]+)/g)
        if (budgetMatches) {
          budget = budgetMatches.join(', ').replace(/@budget@:\s*/g, '')
          content = content.replace(/@budget@:\s*[^@\n]+/g, '').trim()
        }

        // Extract tips
        const tipsMatch = content.match(/Tips:\s*\[(.*?)\]/i)
        if (tipsMatch) {
          tips = tipsMatch[1]
          content = content.replace(/Tips:\s*\[.*?\]/i, '').trim()
        }

        currentActivity = {
          time: timeMatch[1],
          content: content.trim(),
          budget: budget || undefined,
          tips: tips || undefined
        }
      } else if (currentActivity && trimmedSection) {
        // Continue previous activity content
        currentActivity.content += '\n\n' + trimmedSection
      }
    })

    // Add the last day and activity
    if (currentActivity && currentDay) {
      currentDay.activities.push(currentActivity)
    }
    if (currentDay) {
      parsedData.days.push(currentDay)
    }

    return parsedData
  }, [])

  const parsedItinerary = useMemo(() => {
    return parseAIItinerary(aiItinerary)
  }, [aiItinerary, parseAIItinerary])

  return (
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-startDate">Tanggal Mulai</Label>
                  <Input 
                    id="ai-startDate" 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ai-endDate">Tanggal Selesai</Label>
                  <Input 
                    id="ai-endDate" 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
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

              {/* Wishlist Integration Section */}
              {isAuthenticated && bookmarks.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="include-wishlist-ai"
                        checked={includeWishlist}
                        onChange={(e) => {
                          setIncludeWishlist(e.target.checked)
                          if (!e.target.checked) {
                            setSelectedWishlistItems([])
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="include-wishlist-ai" className="flex items-center gap-2">
                        <BookmarkCheck className="h-4 w-4" />
                        Prioritaskan destinasi dari wishlist
                      </Label>
                    </div>

                    {includeWishlist && (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          {relevantWishlist.length > 0 ? (
                            destination ? 
                              `AI akan memprioritaskan destinasi wishlist di ${destination}:` :
                              "AI akan memprioritaskan destinasi dari wishlist Anda:"
                          ) : (
                            destination ? 
                              `Tidak ada destinasi wishlist di ${destination}` :
                              "Pilih kota tujuan untuk melihat wishlist yang relevan"
                          )}
                        </div>

                        {/* Selected Wishlist Items */}
                        {selectedWishlistItems.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-primary">
                              Akan diprioritaskan ({selectedWishlistItems.length}):
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
                {selectedWishlistItems.length > 0 && (
                  <Badge variant="outline" className="bg-primary/10">
                    <BookmarkCheck className="h-3 w-3 mr-1" />
                    +{selectedWishlistItems.length} Wishlist
                  </Badge>
                )}
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
                {isAuthenticated && bookmarks.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    💡 Tip: Centang "Prioritaskan destinasi dari wishlist" untuk itinerary yang lebih personal
                  </p>
                )}
              </div>
            ) : (
              <div className="prose max-w-none">
                {isGenerating ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>AI sedang menyusun itinerary terbaik untuk Anda...</p>
                    {selectedWishlistItems.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        🔄 Memprioritaskan {selectedWishlistItems.length} destinasi dari wishlist Anda
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    {selectedWishlistItems.length > 0 && (
                      <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                          <BookmarkCheck className="h-4 w-4" />
                          Destinasi Prioritas dari Wishlist
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedWishlistItems.map(placeId => {
                            const bookmark = bookmarks.find(b => b.placeId === placeId)
                            if (!bookmark) return null
                            return (
                              <Badge key={placeId} variant="outline" className="text-xs">
                                {bookmark.title}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Parsed AI Itinerary Display */}
                    {parsedItinerary ? (
                      <div className="space-y-6">
                        {/* Overall Plan */}
                        {parsedItinerary.overallPlan && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Rencana Perjalanan
                            </h3>
                            <p className="text-blue-800 text-sm leading-relaxed">
                              {parsedItinerary.overallPlan}
                            </p>
                          </div>
                        )}

                        {/* Days */}
                        {parsedItinerary.days.map((day, dayIndex) => (
                          <div key={dayIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4">
                              <h3 className="font-bold text-lg flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                {day.title}
                              </h3>
                            </div>
                            
                            <div className="p-4 space-y-4">
                              {day.activities.map((activity, activityIndex) => (
                                <div key={activityIndex} className="border-l-4 border-indigo-200 pl-4 py-2">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Clock className="h-4 w-4 text-indigo-600" />
                                    <span className="font-semibold text-indigo-700 text-sm uppercase tracking-wide">
                                      {activity.time}
                                    </span>
                                  </div>
                                  
                                  <div className="text-gray-700 text-sm leading-relaxed mb-3 whitespace-pre-line">
                                    {activity.content}
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-2">
                                    {activity.budget && (
                                      <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs">
                                        <DollarSign className="h-3 w-3" />
                                        {activity.budget}
                                      </div>
                                    )}
                                    
                                    {activity.tips && (
                                      <div className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full text-xs">
                                        <Lightbulb className="h-3 w-3" />
                                        {activity.tips}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Fallback to original display */
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {aiItinerary}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 