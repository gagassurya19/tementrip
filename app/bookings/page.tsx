"use client"

import { Navbar } from "@/components/navbar"
import { useBookings } from "@/hooks/use-bookings"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users, Download, BarChart3, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"

export default function BookingsPage() {
  const {
    getUpcomingBookings,
    getPastBookings,
    getCancelledBookings,
    getCurrentBookings,
    cancelBookingWithConfirmation,
    exportBookings,
    getBookingStats,
    isAuthenticated
  } = useBookings()
  const router = useRouter()

  const upcomingBookings = getUpcomingBookings()
  const pastBookings = getPastBookings()
  const cancelledBookings = getCancelledBookings()
  const currentBookings = getCurrentBookings()
  const stats = getBookingStats()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy")
  }

  const handleCancelBooking = async (bookingId: string) => {
    const cancelled = await cancelBookingWithConfirmation(bookingId)
    if (cancelled) {
      // Optionally show a success message
      console.log("Booking cancelled successfully")
    }
  }

  const renderBookingCard = (booking: any) => {
    const isCurrentBooking = currentBookings.some(cb => cb.id === booking.id)
    
    return (
      <Card key={booking.id} className={`mb-4 ${isCurrentBooking ? 'border-green-500 bg-green-50/30' : ''}`}>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{booking.destinationName}</h3>
                {isCurrentBooking && (
                  <Badge variant="default" className="bg-green-500 text-white animate-pulse">
                    🔥 Sedang Berlangsung
                  </Badge>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4 mt-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  Booked {formatDate(booking.bookingDate)}
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
              <div className="flex items-center">
                <Badge
                  className={
                    booking.status === "confirmed"
                      ? "bg-green-500"
                      : booking.status === "pending"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }
                >
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>
              <p className="text-lg font-semibold mt-2">Rp {booking.totalPrice.toLocaleString()}</p>
              {booking.status !== "cancelled" && (
                <Button
                  variant="outline"
                  size="sm"
                  className={`mt-2 ${isCurrentBooking ? 'text-orange-600 border-orange-500 hover:bg-orange-50' : 'text-red-500 border-red-500 hover:bg-red-50'}`}
                  onClick={() => handleCancelBooking(booking.id)}
                >
                  {isCurrentBooking ? 'Batalkan Perjalanan' : 'Cancel Booking'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container py-8">
        {/* Header with Stats */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Booking Saya</h1>
            <p className="text-muted-foreground">
              Kelola dan pantau semua booking perjalanan Anda
            </p>
          </div>
          
          {stats.total > 0 && (
            <div className="flex items-center gap-2 mt-4 lg:mt-0">
              <Button variant="outline" size="sm" onClick={exportBookings}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        {stats.total > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Booking</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={stats.current > 0 ? 'border-green-500 bg-green-50' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stats.current > 0 ? 'bg-green-200' : 'bg-yellow-100'}`}>
                    <div className={`h-5 w-5 ${stats.current > 0 ? 'text-green-700' : 'text-yellow-600'}`}>✈️</div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current</p>
                    <p className={`text-2xl font-bold ${stats.current > 0 ? 'text-green-700' : ''}`}>{stats.current}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Upcoming</p>
                    <p className="text-2xl font-bold">{stats.upcoming}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-xl font-bold">Rp {stats.totalSpent.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">{stats.past}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="current">
          <TabsList className="mb-6">
            <TabsTrigger value="current">
              Current {stats.current > 0 && `(${stats.current})`}
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming {stats.upcoming > 0 && `(${stats.upcoming})`}
            </TabsTrigger>
            <TabsTrigger value="past">
              Past {stats.past > 0 && `(${stats.past})`}
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled {stats.cancelled > 0 && `(${stats.cancelled})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-2xl font-medium mb-2">Belum ada booking mendatang</h2>
                <p className="text-gray-500 mb-6">Mulai jelajahi destinasi dan book petualangan selanjutnya</p>
                <Link href="/destinations">
                  <Button>Jelajahi Destinasi</Button>
                </Link>
              </div>
            ) : (
              <div>{upcomingBookings.map(renderBookingCard)}</div>
            )}
          </TabsContent>

          <TabsContent value="current">
            {currentBookings.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-6">✈️</div>
                <h2 className="text-2xl font-medium mb-2">Tidak ada perjalanan aktif</h2>
                <p className="text-gray-500 mb-6">Perjalanan yang sedang berlangsung akan muncul di sini</p>
                <Link href="/destinations">
                  <Button>Rencanakan Perjalanan Baru</Button>
                </Link>
              </div>
            ) : (
              <div>
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Perjalanan Aktif - Selamat menikmati liburan Anda!</span>
                  </div>
                </div>
                {currentBookings.map(renderBookingCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastBookings.length === 0 ? (
              <div className="text-center py-16">
                <Clock className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-medium mb-2">Belum ada booking selesai</h2>
                <p className="text-gray-500">Booking yang telah selesai akan muncul di sini</p>
              </div>
            ) : (
              <div>{pastBookings.map(renderBookingCard)}</div>
            )}
          </TabsContent>

          <TabsContent value="cancelled">
            {cancelledBookings.length === 0 ? (
              <div className="text-center py-16">
                <MapPin className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-medium mb-2">Tidak ada booking yang dibatalkan</h2>
                <p className="text-gray-500">Booking yang dibatalkan akan muncul di sini</p>
              </div>
            ) : (
              <div>{cancelledBookings.map(renderBookingCard)}</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
