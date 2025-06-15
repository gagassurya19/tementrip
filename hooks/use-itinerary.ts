/**
 * Custom hook for managing itinerary operations with Supabase
 * Handles CRUD operations, data conversion, and state management
 * 
 * @author Gagassurya19
 * @version 1.0.0
 */

import { useState, useEffect } from 'react'
import type { SavedItinerary } from '@/types/itinerary'

interface UseItineraryReturn {
  itineraries: SavedItinerary[]
  isLoading: boolean
  error: string | null
  fetchItineraries: (userId: string) => Promise<void>
  createItinerary: (itinerary: Omit<SavedItinerary, 'id' | 'createdAt'> & { user_id: string }) => Promise<SavedItinerary | null>
  updateItinerary: (id: string, updates: Partial<SavedItinerary>) => Promise<SavedItinerary | null>
  deleteItinerary: (id: string) => Promise<boolean>
  refreshItineraries: () => Promise<void>
}

export function useItinerary(userId?: string): UseItineraryReturn {
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Convert database row to SavedItinerary format
  const convertDbToItinerary = (dbRow: any): SavedItinerary => ({
    id: dbRow.id,
    title: dbRow.title,
    type: dbRow.type,
    destination: dbRow.destination,
    duration: dbRow.duration,
    interests: dbRow.interests || [],
    budget: dbRow.budget,
    tripType: dbRow.trip_type,
    data: dbRow.data,
    createdAt: dbRow.created_at,
    startDate: dbRow.start_date,
    endDate: dbRow.end_date
  })

  // Convert SavedItinerary to database format
  const convertItineraryToDb = (itinerary: any) => {
    return {
      user_id: itinerary.user_id,
      title: itinerary.title,
      type: itinerary.type,
      destination: itinerary.destination,
      duration: itinerary.duration,
      interests: itinerary.interests || [],
      budget: itinerary.budget,
      trip_type: itinerary.tripType,
      data: itinerary.data,
      start_date: itinerary.startDate,
      end_date: itinerary.endDate
    }
  }

  const fetchItineraries = async (fetchUserId: string) => {
    if (!fetchUserId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/itinerary?userId=${fetchUserId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch itineraries')
      }

      // API returns array directly, not wrapped in itineraries property
      const convertedItineraries = result.map(convertDbToItinerary)
      setItineraries(convertedItineraries)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Error fetching itineraries:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const createItinerary = async (
    itinerary: Omit<SavedItinerary, 'id' | 'createdAt'> & { user_id: string }
  ): Promise<SavedItinerary | null> => {
    setError(null)

    try {
      const dbItinerary = convertItineraryToDb(itinerary)
      
      const response = await fetch('/api/itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dbItinerary),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create itinerary')
      }

      // API returns the itinerary object directly
      const newItinerary = convertDbToItinerary(result)
      
      setItineraries(prev => [newItinerary, ...prev])
      return newItinerary
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Error creating itinerary:', err)
      return null
    }
  }

  const updateItinerary = async (
    id: string,
    updates: Partial<SavedItinerary>
  ): Promise<SavedItinerary | null> => {
    setError(null)

    try {
      const dbUpdates = convertItineraryToDb(updates)
      
      const response = await fetch(`/api/itinerary/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dbUpdates),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update itinerary')
      }

      // API returns the itinerary object directly
      const updatedItinerary = convertDbToItinerary(result)
      setItineraries(prev =>
        prev.map(item => (item.id === id ? updatedItinerary : item))
      )
      return updatedItinerary
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Error updating itinerary:', err)
      return null
    }
  }

  const deleteItinerary = async (id: string): Promise<boolean> => {
    setError(null)

    try {
      const response = await fetch(`/api/itinerary/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete itinerary')
      }

      setItineraries(prev => prev.filter(item => item.id !== id))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Error deleting itinerary:', err)
      return false
    }
  }

  const refreshItineraries = async () => {
    if (userId) {
      await fetchItineraries(userId)
    }
  }

  // Fetch itineraries when userId changes
  useEffect(() => {
    if (userId) {
      fetchItineraries(userId)
    }
  }, [userId])

  return {
    itineraries,
    isLoading,
    error,
    fetchItineraries,
    createItinerary,
    updateItinerary,
    deleteItinerary,
    refreshItineraries,
  }
} 