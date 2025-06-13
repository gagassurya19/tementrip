"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

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
  addBooking: (booking: Omit<Booking, "id" | "bookingDate">) => void
  cancelBooking: (bookingId: string) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const storedBookmarks = localStorage.getItem("bookmarks")
    const storedBookings = localStorage.getItem("bookings")

    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    if (storedBookmarks) {
      setBookmarks(JSON.parse(storedBookmarks))
    }

    if (storedBookings) {
      setBookings(JSON.parse(storedBookings))
    }

    setIsLoading(false)
  }, [])

  // Save user, bookmarks, and bookings to localStorage when they change
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user))
    } else {
      localStorage.removeItem("user")
    }
  }, [user])

  useEffect(() => {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks))
  }, [bookmarks])

  useEffect(() => {
    localStorage.setItem("bookings", JSON.stringify(bookings))
  }, [bookings])

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
    const newBookmark: Bookmark = {
      id: `bookmark-${Date.now()}`,
      placeId: destination.placeId,
      title: destination.title,
      imageUrl: destination.imageUrl,
      city: destination.city,
      state: destination.state,
      dateAdded: new Date().toISOString(),
    }

    setBookmarks((prev) => [...prev, newBookmark])
  }

  const removeBookmark = (bookmarkId: string) => {
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== bookmarkId))
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
        addBooking,
        cancelBooking,
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
