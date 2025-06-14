"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bot, Loader2, Save } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { interestOptions } from "@/lib/constants/interests"
import type { SavedItinerary } from "@/types/itinerary"

interface AIItineraryTabProps {
  onSaveItinerary: (itinerary: SavedItinerary) => void
}

export default function AIItineraryTab({ onSaveItinerary }: AIItineraryTabProps) {
  const { user } = useUser()
  const [destination, setDestination] = useState("")
  const [days, setDays] = useState("3")
  const [interests, setInterests] = useState<string[]>(user?.preferences?.interests || [])
  const [budget, setBudget] = useState(user?.preferences?.budget || "medium")
  const [tripType, setTripType] = useState(user?.preferences?.tripType || "")
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiItinerary, setAiItinerary] = useState("")

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

    onSaveItinerary(newItinerary)
    alert('Itinerary berhasil disimpan!')
  }

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

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
  )
} 