"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import type { User, Session } from "@supabase/supabase-js"

export interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  preferences: {
    tripType: string
    interests: string[]
    budget: string
  }
}

export interface Bookmark {
  id: string
  placeId: string
  title: string
  imageUrl: string
  city: string
  state: string
  dateAdded: string
}

export interface Booking {
  id: string
  destinationId: string
  destinationName: string
  startDate: string
  endDate: string
  status: "confirmed" | "pending" | "cancelled"
  guests: number
  totalPrice: number
  bookingDate: string
}

interface UserContextType {
  user: UserProfile | null
  bookmarks: Bookmark[]
  bookings: Booking[]
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<boolean>
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>
  addBookmark: (destination: any) => Promise<void>
  removeBookmark: (bookmarkId: string) => Promise<void>
  clearAllBookmarks: () => Promise<void>
  isBookmarked: (placeId: string) => boolean
  getBookmarkByPlaceId: (placeId: string) => Bookmark | undefined
  addBooking: (booking: Omit<Booking, "id" | "bookingDate">) => Promise<void>
  cancelBooking: (bookingId: string) => Promise<void>
  clearAllBookings: () => Promise<void>
  getBookingById: (bookingId: string) => Booking | undefined
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)

  // Initialize Supabase auth listener
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        setSession(initialSession)

        if (initialSession?.user) {
          await loadUserProfile(initialSession.user.id)
          await loadUserData(initialSession.user.id)
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          setSession(session)
          
          if (session?.user) {
            await loadUserProfile(session.user.id)
            await loadUserData(session.user.id)
          } else {
            setUser(null)
            setBookmarks([])
            setBookings([])
          }
        })

        return () => subscription.unsubscribe()
      } catch (error) {
        console.error("Auth initialization error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // If user profile doesn't exist but user is authenticated, create it
        if (error.code === 'PGRST116') { // Row not found

          
          // Get user info from auth
          const { data: { user: authUser } } = await supabase.auth.getUser()
          
          if (authUser) {
            const { error: createError } = await supabase
              .from('users')
              .insert({
                id: authUser.id,
                name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
                email: authUser.email || '',
                trip_type: 'solo',
                interests: [],
                budget: 'medium'
              })

            if (createError) {
              console.error("Error creating user profile:", createError)
              return
            }

            // Try to load the profile again
            const { data: newData, error: newError } = await supabase
              .from('users')
              .select('*')
              .eq('id', userId)
              .single()

            if (newError) {
              console.error("Error loading newly created profile:", newError)
              return
            }

            if (newData) {
              const userProfile: UserProfile = {
                id: newData.id,
                name: newData.name,
                email: newData.email,
                phone: newData.phone,
                preferences: {
                  tripType: newData.trip_type || 'solo',
                  interests: newData.interests || [],
                  budget: newData.budget || 'medium'
                }
              }


              setUser(userProfile)
            }
          }
        } else {
          console.error("Error loading user profile:", error)
        }
        return
      }

      if (data) {
        const userProfile: UserProfile = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          preferences: {
            tripType: data.trip_type || 'solo',
            interests: data.interests || [],
            budget: data.budget || 'medium'
          }
        }
        setUser(userProfile)
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
    }
  }

  const loadUserData = async (userId: string) => {
    try {
      // Load bookmarks
      const { data: bookmarksData, error: bookmarksError } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)

      if (bookmarksError) {
        console.error("Error loading bookmarks:", bookmarksError)
      } else {
        const formattedBookmarks: Bookmark[] = bookmarksData.map(bookmark => ({
          id: bookmark.id,
          placeId: bookmark.place_id,
          title: bookmark.title,
          imageUrl: bookmark.image_url || '',
          city: bookmark.city,
          state: bookmark.state,
          dateAdded: bookmark.created_at
        }))
        setBookmarks(formattedBookmarks)
      }

      // Load bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)

      if (bookingsError) {
        console.error("Error loading bookings:", bookingsError)
      } else {
        const formattedBookings: Booking[] = bookingsData.map(booking => ({
          id: booking.id,
          destinationId: booking.destination_id,
          destinationName: booking.destination_name,
          startDate: booking.start_date,
          endDate: booking.end_date,
          status: booking.status as "confirmed" | "pending" | "cancelled",
          guests: booking.guests,
          totalPrice: booking.total_price,
          bookingDate: booking.created_at
        }))
        setBookings(formattedBookings)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error("Login error:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Logout error:", error)
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true)
      
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      })

      if (error) {
        console.error("Registration error:", error)
        
        // Handle specific error cases
        if (error.message.includes("User already registered")) {
          // Since email confirmation is disabled, try to sign in instead

          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          })
          
          if (signInError) {
            // If sign in fails, the user exists but with different password
            throw new Error("An account with this email already exists. Please try signing in or use a different email.")
          }
          
          // If sign in succeeds, return true
          return true
        }
        
        throw new Error(error.message)
      }

      // If registration succeeds, create user profile
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              name,
              email,
              trip_type: 'solo',
              interests: [],
              budget: 'medium'
            })

          if (profileError) {
            console.error("Profile creation error:", profileError)
            // Profile creation failed, but auth user was created
            // The profile will be created automatically when they sign in
          }
        } catch (profileErr) {
          console.error("Profile creation exception:", profileErr)
          // Don't fail registration if profile creation fails
        }
      }

      return true
    } catch (error) {
      console.error("Registration error:", error)
      // Re-throw the error so the UI can display it
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (profile: Partial<UserProfile>) => {
    if (!user || !session?.user) return

    try {
      const updateData: any = {}
      
      if (profile.name) updateData.name = profile.name
      if (profile.email) updateData.email = profile.email
      if (profile.phone) updateData.phone = profile.phone
      if (profile.preferences) {
        updateData.trip_type = profile.preferences.tripType
        updateData.interests = profile.preferences.interests
        updateData.budget = profile.preferences.budget
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)

      if (error) {
        console.error("Profile update error:", error)
        return
      }

      setUser({ ...user, ...profile })
    } catch (error) {
      console.error("Profile update error:", error)
    }
  }

  const addBookmark = async (destination: any) => {
    if (!user || !session?.user) return

    try {
      // Check if bookmark already exists
      const existingBookmark = bookmarks.find(bookmark => bookmark.placeId === destination.placeId)
      if (existingBookmark) {
        console.warn("Bookmark already exists for this destination")
        return
      }

      const { data, error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          place_id: destination.placeId,
          title: destination.title,
          image_url: destination.imageUrl || '',
          city: destination.city,
          state: destination.state
        })
        .select()
        .single()

      if (error) {
        console.error("Add bookmark error:", error)
        return
      }

      const newBookmark: Bookmark = {
        id: data.id,
        placeId: data.place_id,
        title: data.title,
        imageUrl: data.image_url || '',
        city: data.city,
        state: data.state,
        dateAdded: data.created_at
      }

      setBookmarks(prev => [...prev, newBookmark])
    } catch (error) {
      console.error("Add bookmark error:", error)
    }
  }

  const removeBookmark = async (bookmarkId: string) => {
    if (!user || !session?.user) return

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkId)
        .eq('user_id', user.id)

      if (error) {
        console.error("Remove bookmark error:", error)
        return
      }

      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId))
    } catch (error) {
      console.error("Remove bookmark error:", error)
    }
  }

  const clearAllBookmarks = async () => {
    if (!user || !session?.user) return

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        console.error("Clear bookmarks error:", error)
        return
      }

      setBookmarks([])
    } catch (error) {
      console.error("Clear bookmarks error:", error)
    }
  }

  const isBookmarked = (placeId: string) => {
    return bookmarks.some(bookmark => bookmark.placeId === placeId)
  }

  const getBookmarkByPlaceId = (placeId: string) => {
    return bookmarks.find(bookmark => bookmark.placeId === placeId)
  }

  const addBooking = async (bookingData: Omit<Booking, "id" | "bookingDate">) => {
    if (!user || !session?.user) {
      console.error("No user or session found")
      throw new Error("Authentication required")
    }

    try {
      // Convert ISO string dates to date-only format for database
      const startDate = new Date(bookingData.startDate).toISOString().split('T')[0]
      const endDate = new Date(bookingData.endDate).toISOString().split('T')[0]
      
      const insertData = {
        user_id: session.user.id, // Use session.user.id for RLS compatibility
        destination_id: bookingData.destinationId,
        destination_name: bookingData.destinationName,
        start_date: startDate,
        end_date: endDate,
        status: bookingData.status,
        guests: bookingData.guests,
        total_price: bookingData.totalPrice
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error("Add booking error:", error)
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw new Error(`Failed to add booking: ${error.message}`)
      }



      const newBooking: Booking = {
        id: data.id,
        destinationId: data.destination_id,
        destinationName: data.destination_name,
        startDate: data.start_date,
        endDate: data.end_date,
        status: data.status,
        guests: data.guests,
        totalPrice: Number(data.total_price), // Convert decimal to number
        bookingDate: data.created_at
      }

      setBookings(prev => [...prev, newBooking])
    } catch (error) {
      console.error("Add booking error:", error)
      throw error // Re-throw to allow useBookings to handle the error
    }
  }

  const cancelBooking = async (bookingId: string) => {
    if (!user || !session?.user) return

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .eq('user_id', user.id)

      if (error) {
        console.error("Cancel booking error:", error)
        return
      }

      setBookings(prev =>
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' as const } 
            : booking
        )
      )
    } catch (error) {
      console.error("Cancel booking error:", error)
    }
  }

  const clearAllBookings = async () => {
    if (!user || !session?.user) return

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        console.error("Clear bookings error:", error)
        return
      }

      setBookings([])
    } catch (error) {
      console.error("Clear bookings error:", error)
    }
  }

  const getBookingById = (bookingId: string) => {
    return bookings.find(booking => booking.id === bookingId)
  }

  return (
    <UserContext.Provider
      value={{
        user,
        bookmarks,
        bookings,
        isLoading,
        isAuthenticated: session?.user ? true : false,
        login,
        logout,
        register,
        updateProfile,
        addBookmark,
        removeBookmark,
        clearAllBookmarks,
        isBookmarked,
        getBookmarkByPlaceId,
        addBooking,
        cancelBooking,
        clearAllBookings,
        getBookingById,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
