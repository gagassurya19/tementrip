import { useUser } from '@/contexts/user-context'
import { useRouter } from 'next/navigation'
import type { Booking } from '@/contexts/user-context'

export function useBookings() {
  const { 
    bookings, 
    addBooking, 
    cancelBooking,
    isAuthenticated 
  } = useUser()
  const router = useRouter()

  const getUpcomingBookings = () => {
    return bookings.filter(
      (booking) => booking.status !== "cancelled" && new Date(booking.startDate) > new Date()
    )
  }

  const getPastBookings = () => {
    return bookings.filter(
      (booking) => booking.status !== "cancelled" && new Date(booking.endDate) < new Date()
    )
  }

  const getCancelledBookings = () => {
    return bookings.filter((booking) => booking.status === "cancelled")
  }

  const getCurrentBookings = () => {
    const now = new Date()
    return bookings.filter(
      (booking) => 
        booking.status !== "cancelled" && 
        new Date(booking.startDate) <= now && 
        new Date(booking.endDate) >= now
    )
  }

  const getBookingsByStatus = (status: "confirmed" | "pending" | "cancelled") => {
    return bookings.filter((booking) => booking.status === status)
  }

  const getBookingsByDestination = (destinationId: string) => {
    return bookings.filter((booking) => booking.destinationId === destinationId)
  }

  const getTotalSpent = () => {
    return bookings
      .filter((booking) => booking.status !== "cancelled")
      .reduce((total, booking) => total + booking.totalPrice, 0)
  }

  const getBookingCount = () => bookings.length

  const getBookingById = (bookingId: string) => {
    return bookings.find((booking) => booking.id === bookingId)
  }

  const hasBookingForDestination = (destinationId: string) => {
    return bookings.some(
      (booking) => 
        booking.destinationId === destinationId && 
        booking.status !== "cancelled"
    )
  }

  const createBooking = (bookingData: Omit<Booking, "id" | "bookingDate">) => {
    if (!isAuthenticated) {
      router.push('/login')
      return false
    }

    addBooking(bookingData)
    return true
  }

  const cancelBookingWithConfirmation = (bookingId: string) => {
    return new Promise<boolean>((resolve) => {
      if (window.confirm('Apakah Anda yakin ingin membatalkan booking ini?')) {
        cancelBooking(bookingId)
        resolve(true)
      } else {
        resolve(false)
      }
    })
  }

  const exportBookings = () => {
    const data = JSON.stringify(bookings, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `teman-trip-bookings-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getBookingStats = () => {
    const upcoming = getUpcomingBookings()
    const past = getPastBookings()
    const cancelled = getCancelledBookings()
    const current = getCurrentBookings()

    return {
      total: bookings.length,
      upcoming: upcoming.length,
      past: past.length,
      cancelled: cancelled.length,
      current: current.length,
      totalSpent: getTotalSpent(),
      confirmedBookings: getBookingsByStatus('confirmed').length,
      pendingBookings: getBookingsByStatus('pending').length
    }
  }

  return {
    bookings,
    getUpcomingBookings,
    getPastBookings,
    getCancelledBookings,
    getCurrentBookings,
    getBookingsByStatus,
    getBookingsByDestination,
    getTotalSpent,
    getBookingCount,
    getBookingById,
    hasBookingForDestination,
    createBooking,
    cancelBooking,
    cancelBookingWithConfirmation,
    exportBookings,
    getBookingStats,
    isAuthenticated
  }
} 