"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { MapPin, Bot, History } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/contexts/user-context"
import { useItinerary } from "@/hooks/use-itinerary"
import ManualItineraryTab from "@/components/itinerary/manual-itinerary-tab"
import AIItineraryTab from "@/components/itinerary/ai-itinerary-tab"
import HistoryItineraryTab from "@/components/itinerary/history-itinerary-tab"

import type { SavedItinerary, ManualItineraryForm } from "@/types/itinerary"

export default function ItineraryGenerator() {
  const { user, isAuthenticated, isLoading } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>("manual")
  
  // Use the itinerary hook instead of localStorage
  const {
    itineraries: savedItineraries,
    isLoading: itinerariesLoading,
    error: itinerariesError,
    createItinerary,
    deleteItinerary,
    refreshItineraries
  } = useItinerary(user?.id)

  // Authentication check
  useEffect(() => {
    // Only redirect if loading is complete and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  const handleSaveItinerary = async (itinerary: SavedItinerary) => {
    if (!user?.id) {
      alert('Anda harus login terlebih dahulu untuk menyimpan itinerary')
      return
    }

    try {
      const itineraryData = {
        ...itinerary,
        user_id: user.id
      }
      
      const savedItinerary = await createItinerary(itineraryData)
      
      if (savedItinerary) {
        alert('Itinerary berhasil disimpan!')
      } else {
        alert('Gagal menyimpan itinerary. Silakan coba lagi.')
      }
    } catch (error) {
      console.error('Error saving itinerary:', error)
      
      if (error instanceof Error) {
        alert(`Gagal menyimpan itinerary: ${error.message}`)
      } else {
        alert('Gagal menyimpan itinerary. Silakan coba lagi.')
      }
    }
  }

  const handleDeleteItinerary = async (id: string) => {
    try {
      const success = await deleteItinerary(id)
      if (!success) {
        alert('Gagal menghapus itinerary. Silakan coba lagi.')
      }
    } catch (error) {
      console.error('Error deleting itinerary:', error)
      alert('Gagal menghapus itinerary. Silakan coba lagi.')
    }
  }

  const handleEditItinerary = (itinerary: SavedItinerary) => {
    if (itinerary.type === 'manual') {
      setActiveTab('manual')
    } else {
      setActiveTab('ai')
    }
    // Each tab component will handle its own state updates
  }

  // Show loading state while checking authentication or loading itineraries
  if (isLoading || (isAuthenticated && itinerariesLoading)) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {isLoading ? 'Loading...' : 'Memuat itinerary...'}
            </p>
          </div>
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return null
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

        {/* Show error message if there's an error loading itineraries */}
        {itinerariesError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">
              Error memuat itinerary: {itinerariesError}
            </p>
            <button 
              onClick={refreshItineraries}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Coba lagi
            </button>
          </div>
        )}



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
