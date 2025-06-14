export interface SavedItinerary {
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

export interface ManualItineraryForm {
  destination: string
  startDate: string
  endDate: string
  tripType: string
  interests: string[]
  budget: string
  duration: string
}

export interface InterestOption {
  id: string
  label: string
  icon: string
}

export interface DestinationLocation {
  lat: number
  lng: number
  title: string
  placeId: string
  description?: string
} 