"use client"

import type React from "react"
import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { History, MapPin, Clock, Bot, Trash2, Calendar, DollarSign, Lightbulb } from "lucide-react"
import { LeafletRouteMap } from "@/components/leaflet-route-map"
import { Badge } from "@/components/ui/badge"
import { interestOptions } from "@/lib/constants/interests"
import type { SavedItinerary, ManualItineraryForm } from "@/types/itinerary"

interface HistoryItineraryTabProps {
  savedItineraries: SavedItinerary[]
  onDeleteItinerary: (id: string) => void
  onEditItinerary: (itinerary: SavedItinerary) => void
}

export default function HistoryItineraryTab({ 
  savedItineraries, 
  onDeleteItinerary, 
  onEditItinerary 
}: HistoryItineraryTabProps) {
  const [selectedHistoryItinerary, setSelectedHistoryItinerary] = useState<SavedItinerary | null>(null)
  const [showHistoryDetail, setShowHistoryDetail] = useState(false)
  const [showRoute, setShowRoute] = useState(true)

  // Parser function for AI response (same as in AI tab)
  const parseAIItinerary = useCallback((rawItinerary: string) => {
    if (!rawItinerary || typeof rawItinerary !== 'string') return null

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
    if (selectedHistoryItinerary?.type === 'ai' && selectedHistoryItinerary.data) {
      return parseAIItinerary(selectedHistoryItinerary.data)
    }
    return null
  }, [selectedHistoryItinerary, parseAIItinerary])

  const loadSavedItinerary = (itinerary: SavedItinerary) => {
    setSelectedHistoryItinerary(itinerary)
    setShowHistoryDetail(true)
  }

  const handleDeleteItinerary = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus itinerary ini?')) {
      onDeleteItinerary(id)
      // Reset view if deleted item was currently selected
      if (selectedHistoryItinerary?.id === id) {
        setSelectedHistoryItinerary(null)
        setShowHistoryDetail(false)
      }
    }
  }

  return (
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
              <div className="space-y-3 pt-1">
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
                            handleDeleteItinerary(itinerary.id)
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
                            onEditItinerary(itinerary)
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
                      <div className="prose max-w-none">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed bg-gray-50 p-4 rounded-lg">
                          {selectedHistoryItinerary.data}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 