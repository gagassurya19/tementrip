"use client"

import { Navbar } from "@/components/navbar"
import { useUser } from "@/contexts/user-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"

export default function BookingsPage() {
  const { bookings, cancelBooking, isAuthenticated } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  const upcomingBookings = bookings.filter(
    (booking) => booking.status !== "cancelled" && new Date(booking.startDate) > new Date(),
  )
  const pastBookings = bookings.filter(
    (booking) => booking.status !== "cancelled" && new Date(booking.endDate) < new Date(),
  )
  const cancelledBookings = bookings.filter((booking) => booking.status === "cancelled")

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy")
  }

  const renderBookingCard = (booking: any) => (
    <Card key={booking.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-semibold text-lg">{booking.destinationName}</h3>
            <div className="flex flex-col sm:flex-row sm:gap-4 mt-2">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-1" />
                {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
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
                className="mt-2 text-red-500 border-red-500 hover:bg-red-50"
                onClick={() => cancelBooking(booking.id)}
              >
                Cancel Booking
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

        <Tabs defaultValue="upcoming">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-2xl font-medium mb-2">No upcoming bookings</h2>
                <p className="text-gray-500 mb-6">Start exploring destinations and book your next adventure</p>
                <Link href="/destinations">
                  <Button>Explore Destinations</Button>
                </Link>
              </div>
            ) : (
              <div>{upcomingBookings.map(renderBookingCard)}</div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastBookings.length === 0 ? (
              <div className="text-center py-16">
                <Clock className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-medium mb-2">No past bookings</h2>
              </div>
            ) : (
              <div>{pastBookings.map(renderBookingCard)}</div>
            )}
          </TabsContent>

          <TabsContent value="cancelled">
            {cancelledBookings.length === 0 ? (
              <div className="text-center py-16">
                <MapPin className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-medium mb-2">No cancelled bookings</h2>
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
