"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { MapPin, Bot, History } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/contexts/user-context"
import ManualItineraryTab from "@/components/itinerary/manual-itinerary-tab"
import AIItineraryTab from "@/components/itinerary/ai-itinerary-tab"
import HistoryItineraryTab from "@/components/itinerary/history-itinerary-tab"
import type { SavedItinerary, ManualItineraryForm } from "@/types/itinerary"

export default function ItineraryGenerator() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState<string>("manual")
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

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
    setIsLoaded(true)
  }, [])

  // Save itineraries to localStorage whenever savedItineraries changes (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('savedItineraries', JSON.stringify(savedItineraries))
    }
  }, [savedItineraries, isLoaded])

  const handleSaveItinerary = (itinerary: SavedItinerary) => {
    setSavedItineraries(prev => [itinerary, ...prev])
  }

  const handleDeleteItinerary = (id: string) => {
    setSavedItineraries(prev => prev.filter(item => item.id !== id))
  }

  const handleEditItinerary = (itinerary: SavedItinerary) => {
    if (itinerary.type === 'manual') {
      setActiveTab('manual')
    } else {
      setActiveTab('ai')
    }
    // Each tab component will handle its own state updates
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
            <ManualItineraryTab onSaveItinerary={handleSaveItinerary} />
          </TabsContent>

          <TabsContent value="ai" className="space-y-8">
            <AIItineraryTab onSaveItinerary={handleSaveItinerary} />
          </TabsContent>

          <TabsContent value="history" className="space-y-8">
            <HistoryItineraryTab
              savedItineraries={savedItineraries}
              onDeleteItinerary={handleDeleteItinerary}
              onEditItinerary={handleEditItinerary}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
