"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, Send, Bot, MapPin, Calendar, AlertTriangle, Sun, Cloud, Droplets, DollarSign, Users, Clock, Star, Info, CheckCircle, Heart, Coffee, Camera, Utensils, Car, Shield, Trophy, Zap } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Component to render formatted travel responses with advanced parsing
function FormattedResponse({ content }: { content: string }) {
  // Enhanced markdown parsing with better regex and cleaning
  const parseMarkdown = (text: string): React.ReactNode => {
    // First, clean up malformed markdown
    let cleanText = text
      .replace(/\[highlight\]([^/]+)\/highlight/g, '[$1]') // Fix malformed [highlight]text/highlight
      .replace(/harga:\s*([^.]+)/gi, '@$1@') // Convert "harga: 25 ribu" to "@25 ribu@"
      .replace(/mulai dari\s+([^.]+)/gi, '@Mulai dari $1@') // Convert price mentions
      .replace(/rp\.?\s*(\d+[^.]*)/gi, '@Rp $1@') // Convert "Rp 25.000" to "@Rp 25.000@"

    const parts: React.ReactNode[] = []
    let currentIndex = 0
    let partIndex = 0

    // Enhanced regex for various markdown patterns
    const markdownRegex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)|(!([^!]+)!)|(\[([^\]]+)\])|(@([^@]+)@)/g
    let match

    while ((match = markdownRegex.exec(cleanText)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        const beforeText = cleanText.slice(currentIndex, match.index)
        if (beforeText.trim()) {
          parts.push(
            <span key={`text-${partIndex++}`}>
              {beforeText}
            </span>
          )
        }
      }

      // Add the formatted match
      if (match[1]) {
        // Bold text **text**
        parts.push(
          <strong key={`bold-${partIndex++}`} className="font-semibold text-gray-900 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-200">
            {match[2]}
          </strong>
        )
      } else if (match[3]) {
        // Italic text *text*
        parts.push(
          <em key={`italic-${partIndex++}`} className="italic text-blue-700 font-medium bg-blue-50 px-1 py-0.5 rounded">
            {match[4]}
          </em>
        )
      } else if (match[5]) {
        // Code text `code`
        parts.push(
          <code key={`code-${partIndex++}`} className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800 border">
            {match[6]}
          </code>
        )
      } else if (match[7]) {
        // Important text !text!
        parts.push(
          <span key={`important-${partIndex++}`} className="bg-red-100 text-red-800 px-2 py-1 rounded font-medium border border-red-200 shadow-sm">
            ⚠️ {match[8]}
          </span>
        )
      } else if (match[9]) {
        // Highlight text [text]
        parts.push(
          <span key={`highlight-${partIndex++}`} className="bg-green-100 text-green-800 px-2 py-1 rounded font-medium border border-green-200 shadow-sm">
            ✨ {match[10]}
          </span>
        )
      } else if (match[11]) {
        // Price/money text @text@
        parts.push(
          <span key={`price-${partIndex++}`} className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-semibold border border-emerald-200 shadow-sm inline-flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {match[12]}
          </span>
        )
      }

      currentIndex = match.index + match[0].length
    }

    // Add remaining text
    if (currentIndex < cleanText.length) {
      const remainingText = cleanText.slice(currentIndex)
      if (remainingText.trim()) {
        parts.push(
          <span key={`text-${partIndex++}`}>
            {remainingText}
          </span>
        )
      }
    }

    return parts.length > 0 ? <>{parts}</> : cleanText
  }

  // Advanced content parsing with better structure detection
  const formatContent = (text: string) => {
    // Normalize text and split into meaningful sections
    const normalizedText = text
      .replace(/###\s+/g, '') // Remove markdown headers
      .replace(/💡 Tips & Saran\s*/g, 'Tips: ') // Normalize tip headers
      .replace(/⚠️ Penting!\s*/g, 'Penting: ') // Normalize important headers
    
    const sections = normalizedText.split(/\n\s*\n/).filter(s => s.trim())
    const formattedElements: React.ReactNode[] = []
    let sectionIndex = 0

    sections.forEach((section, index) => {
      const lines = section.split('\n').map(line => line.trim()).filter(line => line)
      if (lines.length === 0) return

      const firstLine = lines[0]
      const fullText = lines.join(' ')

      // Enhanced detection logic
      const isIntroSection = index === 0 && (
        firstLine.toLowerCase().includes('oke') ||
        firstLine.toLowerCase().includes('nah,') ||
        firstLine.toLowerCase().includes('asik') ||
        firstLine.toLowerCase().includes('seru') ||
        (fullText.length > 150 && !firstLine.includes(':'))
      )

      const isNumberedHeader = firstLine.match(/^\d+\.\s+(.+)$/)
      const isDaySection = firstLine.toLowerCase().match(/^(hari \d+|day \d+)/i)
      
      const isTipsSection = (
        firstLine.toLowerCase().startsWith('tips:') ||
        firstLine.toLowerCase().includes('💡') ||
        section.toLowerCase().includes('tips:')
      )

      const isImportantSection = (
        firstLine.toLowerCase().startsWith('penting:') ||
        firstLine.toLowerCase().includes('⚠️') ||
        section.toLowerCase().includes('penting:')
      )

      const isListSection = lines.some(line => 
        line.match(/^[•\-*]\s+/) || 
        line.match(/^\d+\.\s+/) ||
        line.includes(':') && line.length < 100
      )

      // Smart icon selection with more variety
      const getSmartIcon = (text: string, type: string) => {
        const lowerText = text.toLowerCase()
        
        if (type === 'intro') return <Zap className="h-5 w-5 text-blue-600" />
        if (type === 'day') return <Calendar className="h-5 w-5 text-purple-600" />
        if (type === 'tips') return <CheckCircle className="h-5 w-5 text-green-600" />
        if (type === 'important') return <AlertTriangle className="h-5 w-5 text-red-600" />

        // Content-based icons
        if (lowerText.includes('cuaca') || lowerText.includes('musim')) return <Sun className="h-5 w-5 text-yellow-500" />
        if (lowerText.includes('makan') || lowerText.includes('kuliner') || lowerText.includes('restoran')) return <Utensils className="h-5 w-5 text-orange-500" />
        if (lowerText.includes('tempat') || lowerText.includes('wisata') || lowerText.includes('destinasi')) return <Camera className="h-5 w-5 text-blue-500" />
        if (lowerText.includes('hotel') || lowerText.includes('penginapan') || lowerText.includes('menginap')) return <Heart className="h-5 w-5 text-pink-500" />
        if (lowerText.includes('transportasi') || lowerText.includes('kendaraan') || lowerText.includes('travel')) return <Car className="h-5 w-5 text-gray-600" />
        if (lowerText.includes('biaya') || lowerText.includes('harga') || lowerText.includes('budget')) return <DollarSign className="h-5 w-5 text-green-600" />
        if (lowerText.includes('budaya') || lowerText.includes('adat') || lowerText.includes('tradisi')) return <Users className="h-5 w-5 text-indigo-500" />
        if (lowerText.includes('keamanan') || lowerText.includes('safety')) return <Shield className="h-5 w-5 text-red-400" />
        if (lowerText.includes('rekomendasi') || lowerText.includes('suggest')) return <Trophy className="h-5 w-5 text-amber-500" />
        if (lowerText.includes('waktu') || lowerText.includes('jam') || lowerText.includes('schedule')) return <Clock className="h-5 w-5 text-purple-500" />
        
        return <Star className="h-5 w-5 text-gray-400" />
      }

      // Render different section types
      if (isIntroSection) {
        formattedElements.push(
          <div key={`intro-${sectionIndex++}`} className="mb-6">
            <div className="relative p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200 shadow-sm overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
              <div className="relative flex items-start gap-4">
                <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
                  <Bot className="h-6 w-6 text-blue-700" />
                </div>
                <div className="flex-1">
                  <div className="text-gray-800 leading-relaxed text-base">
                    {lines.map((line, lineIndex) => (
                      <div key={lineIndex} className="mb-2 last:mb-0">
                        {parseMarkdown(line)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      } else if (isNumberedHeader) {
        // Handle numbered headers like "1. Jogja: Surga Kuliner"
        const headerText = isNumberedHeader[1]
        const restContent = lines.slice(1).filter(line => line.trim())
        
        formattedElements.push(
          <div key={`numbered-${sectionIndex++}`} className="mb-6">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-amber-100 to-orange-100 border-b border-amber-200">
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-amber-700" />
                  <h2 className="text-xl font-bold text-amber-800">{parseMarkdown(headerText)}</h2>
                </div>
              </div>
              {restContent.length > 0 && (
                <div className="p-6">
                  <div className="space-y-3">
                    {restContent.map((line, lineIndex) => (
                      <div key={lineIndex} className="text-gray-800 leading-relaxed">
                        {parseMarkdown(line)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      } else if (isDaySection) {
        const dayMatch = firstLine.match(/^(hari \d+|day \d+)/i)
        const dayTitle = dayMatch ? dayMatch[0] : 'Hari'
        const restContent = lines.slice(1)
        
        formattedElements.push(
          <div key={`day-${sectionIndex++}`} className="mb-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-purple-100 to-pink-100 border-b border-purple-200">
                <div className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-purple-700" />
                  <h3 className="text-xl font-bold text-purple-800 capitalize">{dayTitle}</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {restContent.map((line, lineIndex) => (
                    <div key={lineIndex} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                      <div className="text-gray-800 leading-relaxed">
                        {parseMarkdown(line)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      } else if (isListSection) {
        // Enhanced list detection and parsing
        const culinaryItems: string[] = []
        const regularItems: string[] = []
        let headerLine = ''
        
        lines.forEach(line => {
          if (line.match(/^[•\-*]\s+/) || line.includes(':') && line.length < 100) {
            if (line.toLowerCase().includes('gudeg') || 
                line.toLowerCase().includes('sate') || 
                line.toLowerCase().includes('mie') ||
                line.toLowerCase().includes('nasi') ||
                line.toLowerCase().includes('soto') ||
                line.toLowerCase().includes('warung')) {
              culinaryItems.push(line)
            } else {
              regularItems.push(line)
            }
          } else if (!headerLine && line.length > 0) {
            headerLine = line
          }
        })
        
        const allItems = [...culinaryItems, ...regularItems]
        
        if (allItems.length > 0) {
          formattedElements.push(
            <div key={`list-${sectionIndex++}`} className="mb-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {headerLine && (
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      {getSmartIcon(headerLine, 'list')}
                      <h3 className="text-lg font-semibold text-gray-800">{parseMarkdown(headerLine)}</h3>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <div className="space-y-4">
                    {allItems.map((item, itemIndex) => {
                      const cleanItem = item.replace(/^[•\-*]\s*/, '').replace(/^\d+\.\s*/, '')
                      const isCulinaryItem = culinaryItems.includes(item)
                      
                      return (
                        <div key={itemIndex} className={`p-4 rounded-lg border ${isCulinaryItem ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {isCulinaryItem ? (
                                <Utensils className="h-5 w-5 text-orange-600" />
                              ) : (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              )}
                            </div>
                            <div className="flex-1 text-gray-800 leading-relaxed">
                              {parseMarkdown(cleanItem)}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )
        }
      } else if (isTipsSection) {
        formattedElements.push(
          <div key={`tips-${sectionIndex++}`} className="mb-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">💡 Tips & Saran</h3>
                  <div className="space-y-2">
                    {lines.map((line, lineIndex) => (
                      <div key={lineIndex} className="text-gray-800 leading-relaxed">
                        {parseMarkdown(line)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      } else if (isImportantSection) {
        formattedElements.push(
          <div key={`important-${sectionIndex++}`} className="mb-6">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800 mb-3">⚠️ Penting!</h3>
                  <div className="space-y-2">
                    {lines.map((line, lineIndex) => (
                      <div key={lineIndex} className="text-gray-800 leading-relaxed">
                        {parseMarkdown(line)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      } else {
        // Regular content with smart styling
        const contentType = firstLine.length < 50 ? 'header' : 'content'
        
        formattedElements.push(
          <div key={`content-${sectionIndex++}`} className="mb-4">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getSmartIcon(fullText, contentType)}
                  </div>
                  <div className="flex-1">
                    <div className="space-y-3">
                      {lines.map((line, lineIndex) => (
                        <div key={lineIndex} className="text-gray-800 leading-relaxed">
                          {parseMarkdown(line)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    })

    return formattedElements
  }

  return (
    <div className="space-y-1">
      {formatContent(content)}
    </div>
  )
}

export function TravelAssistant() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState("chat")
  const [isLoading, setIsLoading] = useState(false)
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false)

  // Itinerary generation state
  const [destination, setDestination] = useState("")
  const [days, setDays] = useState("3")
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [budget, setBudget] = useState("medium")
  const [itinerary, setItinerary] = useState("")
  const [isInitialized, setIsInitialized] = useState(false)

  // Destination info state
  const [infoDestination, setInfoDestination] = useState("")
  const [destinationInfo, setDestinationInfo] = useState("")

  // Initialize form with user preferences only once
  useEffect(() => {
    if (user && !isInitialized) {
      setSelectedInterests(user.preferences?.interests || [])
      setBudget(user.preferences?.budget || "medium")
      setIsInitialized(true)
    }
  }, [user, isInitialized])

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setIsLoading(true)
    setAnswer("")
    setIsQuotaExceeded(false)

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "answerQuestion",
          params: { question },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setAnswer(data.result)
      } else if (response.status === 429 && data.isQuotaError) {
        setIsQuotaExceeded(true)
        setAnswer(data.message || "API quota exceeded. Please try again later.")
      } else if (response.status === 503 && (data.isServiceUnavailable || data.isOverloaded)) {
        setAnswer(data.message || "All AI models are currently overloaded. Please try again in a few minutes.")
      } else {
        setAnswer(data.message || "Sorry, I couldn't process your question. Please try again.")
      }
    } catch (error) {
      setAnswer("An error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleItineraryGeneration = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!destination.trim()) return

    setIsLoading(true)
    setItinerary("")
    setIsQuotaExceeded(false)

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
            interests: selectedInterests,
            budget,
          },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setItinerary(data.result)
      } else if (response.status === 429 && data.isQuotaError) {
        setIsQuotaExceeded(true)
        setItinerary(data.message || "API quota exceeded. Please try again later.")
      } else if (response.status === 503 && (data.isServiceUnavailable || data.isOverloaded)) {
        setItinerary(data.message || "All AI models are currently overloaded. Please try again in a few minutes.")
      } else {
        setItinerary(data.message || "Sorry, I couldn't generate an itinerary. Please try again.")
      }
    } catch (error) {
      setItinerary("An error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDestinationInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!infoDestination.trim()) return

    setIsLoading(true)
    setDestinationInfo("")
    setIsQuotaExceeded(false)

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "getDestinationInfo",
          params: { destination: infoDestination },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setDestinationInfo(data.result)
      } else if (response.status === 429 && data.isQuotaError) {
        setIsQuotaExceeded(true)
        setDestinationInfo(data.message || "API quota exceeded. Please try again later.")
      } else if (response.status === 503 && (data.isServiceUnavailable || data.isOverloaded)) {
        setDestinationInfo(data.message || "All AI models are currently overloaded. Please try again in a few minutes.")
      } else {
        setDestinationInfo(data.message || "Sorry, I couldn't retrieve information about this destination. Please try again.")
      }
    } catch (error) {
      setDestinationInfo("An error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]))
  }

  // Render quota exceeded alert
  const renderQuotaAlert = () => (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>API Quota Exceeded</AlertTitle>
      <AlertDescription>
        We've reached our API usage limit. Please try again later or contact support for assistance.
      </AlertDescription>
    </Alert>
  )

  return (
    <div className="w-full">
      {isQuotaExceeded && renderQuotaAlert()}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="chat">Ask a Question</TabsTrigger>
          <TabsTrigger value="itinerary">Generate Itinerary</TabsTrigger>
          <TabsTrigger value="info">Destination Info</TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="sticky top-20">
                <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-blue-500" />
                    Ask a Question
                  </CardTitle>
                  <CardDescription>Get answers to your travel-related questions</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleQuestionSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="question">Your Question</Label>
                      <Input
                        id="question"
                        placeholder="E.g., What's the best time to visit Bali?"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <Button type="submit" disabled={isLoading || !question.trim()} className="w-full">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Getting Answer...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Ask Assistant
                        </>
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
                  <CardTitle>AI Response</CardTitle>
                </CardHeader>
                <CardContent>
                  {!answer && !isLoading ? (
                    <div className="text-center py-12">
                      <Bot className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-xl font-medium mb-2">No question asked yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Ask any travel-related question to get started
                      </p>
                    </div>
                  ) : isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                      <p className="text-lg font-medium">Finding the best answer for you...</p>
                      <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
                    </div>
                  ) : (
                    <div className="overflow-y-auto">
                      <FormattedResponse content={answer} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="itinerary">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="sticky top-20">
                <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-500" />
                    Generate Itinerary
                  </CardTitle>
                  <CardDescription>Create a personalized travel itinerary</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleItineraryGeneration} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="destination">Destination</Label>
                      <Input
                        id="destination"
                        placeholder="E.g., Bali, Indonesia"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="days">Number of Days</Label>
                        <Select value={days} onValueChange={setDays} disabled={isLoading}>
                          <SelectTrigger id="days">
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
                        <Label htmlFor="budget">Budget</Label>
                        <Select value={budget} onValueChange={setBudget} disabled={isLoading}>
                          <SelectTrigger id="budget">
                            <SelectValue placeholder="Select budget" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="budget">Budget</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="luxury">Luxury</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Interests</Label>
                      <div className="flex flex-wrap gap-2">
                        {["nature", "culture", "food", "adventure", "relaxation", "history", "shopping", "nightlife"].map(
                          (interest) => (
                            <Button
                              key={interest}
                              type="button"
                              variant={selectedInterests.includes(interest) ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleInterest(interest)}
                              disabled={isLoading}
                              className="capitalize"
                            >
                              {interest}
                            </Button>
                          ),
                        )}
                      </div>
                    </div>

                    <Button type="submit" disabled={isLoading || !destination.trim()} className="w-full">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Itinerary...
                        </>
                      ) : (
                        <>
                          <Calendar className="mr-2 h-4 w-4" />
                          Generate Itinerary
                        </>
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
                  <CardTitle>Generated Itinerary</CardTitle>
                </CardHeader>
                <CardContent>
                  {!itinerary && !isLoading ? (
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-xl font-medium mb-2">No itinerary generated yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Fill in your destination details to generate a personalized itinerary
                      </p>
                    </div>
                  ) : isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="h-12 w-12 animate-spin text-green-500 mb-4" />
                      <p className="text-lg font-medium">Creating your personalized itinerary...</p>
                      <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
                    </div>
                  ) : (
                    <div className="overflow-y-auto">
                      <FormattedResponse content={itinerary} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="info">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="sticky top-20">
                <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-purple-500" />
                    Destination Info
                  </CardTitle>
                  <CardDescription>Get detailed information about any destination</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDestinationInfo} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="infoDestination">Destination</Label>
                      <Input
                        id="infoDestination"
                        placeholder="E.g., Tokyo, Japan"
                        value={infoDestination}
                        onChange={(e) => setInfoDestination(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <Button type="submit" disabled={isLoading || !infoDestination.trim()} className="w-full">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Getting Info...
                        </>
                      ) : (
                        <>
                          <MapPin className="mr-2 h-4 w-4" />
                          Get Destination Info
                        </>
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
                  <CardTitle>Destination Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {!destinationInfo && !isLoading ? (
                    <div className="text-center py-12">
                      <MapPin className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-xl font-medium mb-2">No destination info yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Enter a destination to get comprehensive travel information
                      </p>
                    </div>
                  ) : isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
                      <p className="text-lg font-medium">Gathering destination information...</p>
                      <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
                    </div>
                  ) : (
                    <div className="overflow-y-auto">
                      <FormattedResponse content={destinationInfo} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          Powered by Google Gemini AI. Responses may not always be accurate.
        </p>
        {isQuotaExceeded && (
          <Button variant="outline" size="sm" onClick={() => setIsQuotaExceeded(false)} className="mt-2">
            Dismiss Quota Alert
          </Button>
        )}
      </div>
    </div>
  )
}
