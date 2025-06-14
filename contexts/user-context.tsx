"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// localStorage utility functions
const STORAGE_KEYS = {
  user: "teman-trip-user",
  bookmarks: "teman-trip-bookmarks", 
  bookings: "teman-trip-bookings"
} as const

const storageUtils = {
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
    }
  },
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error)
      return null
    }
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error)
    }
  },
  clear: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.error("Error clearing localStorage:", error)
    }
  }
}

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
  logout: () => void
  register: (name: string, email: string, password: string) => Promise<boolean>
  updateProfile: (profile: Partial<UserProfile>) => void
  addBookmark: (destination: any) => void
  removeBookmark: (bookmarkId: string) => void
  clearAllBookmarks: () => void
  isBookmarked: (placeId: string) => boolean
  getBookmarkByPlaceId: (placeId: string) => Bookmark | undefined
  addBooking: (booking: Omit<Booking, "id" | "bookingDate">) => void
  cancelBooking: (bookingId: string) => void
  clearAllBookings: () => void
  getBookingById: (bookingId: string) => Booking | undefined
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  // Check if user is logged in on mount
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const storedUser = storageUtils.get(STORAGE_KEYS.user)
        const storedBookmarks = storageUtils.get(STORAGE_KEYS.bookmarks)
        const storedBookings = storageUtils.get(STORAGE_KEYS.bookings)

        if (storedUser) {
          setUser(storedUser)
        }

        if (storedBookmarks && Array.isArray(storedBookmarks)) {
          setBookmarks(storedBookmarks)
        }

        if (storedBookings && Array.isArray(storedBookings)) {
          setBookings(storedBookings)
        }
      } catch (error) {
        console.error("Error loading data from localStorage:", error)
        // Clear potentially corrupted data
        storageUtils.clear()
      } finally {
        setIsLoading(false)
        setIsInitialized(true)
      }
    }

    loadFromStorage()
  }, [])

  // Save user to localStorage when it changes
  useEffect(() => {
    if (!isInitialized) return

    if (user) {
      storageUtils.set(STORAGE_KEYS.user, user)
    } else {
      storageUtils.remove(STORAGE_KEYS.user)
    }
  }, [user, isInitialized])

  // Save bookmarks to localStorage when they change
  useEffect(() => {
    if (!isInitialized) return
    storageUtils.set(STORAGE_KEYS.bookmarks, bookmarks)
  }, [bookmarks, isInitialized])

  // Save bookings to localStorage when they change
  useEffect(() => {
    if (!isInitialized) return
    storageUtils.set(STORAGE_KEYS.bookings, bookings)
  }, [bookings, isInitialized])

  const login = async (email: string, password: string) => {
    // In a real app, this would call an API
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock user data
    const mockUser: UserProfile = {
      id: "user123",
      name: "John Doe",
      email,
      phone: "+62 812 3456 7890",
      preferences: {
        tripType: "family",
        interests: ["nature", "culture"],
        budget: "medium",
      },
    }

    setUser(mockUser)
    setIsLoading(false)
    return true
  }

  const logout = () => {
    setUser(null)
  }

  const register = async (name: string, email: string, password: string) => {
    // In a real app, this would call an API
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock user data
    const mockUser: UserProfile = {
      id: "user" + Math.floor(Math.random() * 1000),
      name,
      email,
      preferences: {
        tripType: "solo",
        interests: [],
        budget: "medium",
      },
    }

    setUser(mockUser)
    setIsLoading(false)
    return true
  }

  const updateProfile = (profile: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...profile })
    }
  }

  const addBookmark = (destination: any) => {
    // Check if bookmark already exists
    const existingBookmark = bookmarks.find(bookmark => bookmark.placeId === destination.placeId)
    if (existingBookmark) {
      console.warn("Bookmark already exists for this destination")
      return
    }

    const newBookmark: Bookmark = {
      id: `bookmark-${Date.now()}`,
      placeId: destination.placeId,
      title: destination.title,
      imageUrl: destination.imageUrl || "",
      city: destination.city,
      state: destination.state,
      dateAdded: new Date().toISOString(),
    }

    setBookmarks((prev) => [...prev, newBookmark])
  }

  const removeBookmark = (bookmarkId: string) => {
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== bookmarkId))
  }

  const clearAllBookmarks = () => {
    setBookmarks([])
  }

  const isBookmarked = (placeId: string) => {
    return bookmarks.some(bookmark => bookmark.placeId === placeId)
  }

  const getBookmarkByPlaceId = (placeId: string) => {
    return bookmarks.find(bookmark => bookmark.placeId === placeId)
  }

  const addBooking = (bookingData: Omit<Booking, "id" | "bookingDate">) => {
    const newBooking: Booking = {
      ...bookingData,
      id: `booking-${Date.now()}`,
      bookingDate: new Date().toISOString(),
    }

    setBookings((prev) => [...prev, newBooking])
  }

  const cancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((booking) => (booking.id === bookingId ? { ...booking, status: "cancelled" as const } : booking)),
    )
  }

  const clearAllBookings = () => {
    setBookings([])
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
        isAuthenticated: !!user,
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
