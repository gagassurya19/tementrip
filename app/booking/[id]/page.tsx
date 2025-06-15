"use client"

import type React from "react"

import { Navbar } from "@/components/navbar"
import { useUser } from "@/contexts/user-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Minus, Plus, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { destinations } from "@/lib/data"
import Image from "next/image"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addDays, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"
import Link from "next/link"

export default function BookingPage({ params }: { params: { id: string } }) {
  const { isAuthenticated, isLoading, addBooking } = useUser()
  const router = useRouter()
  const destination = destinations.find((d) => d.placeId === params.id)

  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 3),
  })
  const [guests, setGuests] = useState(2)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Only redirect if loading is complete and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!destination) {
    return (
      <>
        <Navbar />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Destination not found</h1>
          <p className="mb-6">The destination you're looking for doesn't exist.</p>
          <Link href="/destinations">
            <Button>Browse Destinations</Button>
          </Link>
        </div>
      </>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date?.from || !date?.to) return

    setIsSubmitting(true)

    // Calculate price based on days and guests
    const days = differenceInDays(date.to, date.from) + 1
    const basePrice = 500000 // Rp 500,000 per day
    const totalPrice = basePrice * days * guests

    addBooking({
      destinationId: destination.placeId,
      destinationName: destination.title,
      startDate: date.from.toISOString(),
      endDate: date.to.toISOString(),
      status: "confirmed",
      guests,
      totalPrice,
    })

    setTimeout(() => {
      router.push("/bookings")
    }, 1000)
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Book Your Trip</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Destination</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 rounded-md overflow-hidden">
                        <Image
                          src={destination.imageUrl || "/placeholder.svg?height=64&width=64"}
                          alt={destination.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{destination.title}</h3>
                        <p className="text-sm text-gray-500">
                          {destination.city}, {destination.state}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Travel Dates</Label>
                    <div className="grid gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date?.from ? (
                              date.to ? (
                                <>
                                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(date.from, "LLL dd, y")
                              )
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Number of Guests</Label>
                    <div className="flex items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="w-16 text-center">
                        <span className="text-lg font-medium">{guests}</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setGuests(Math.min(10, guests + 1))}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting || !date?.from || !date?.to}>
                    {isSubmitting ? "Processing..." : "Confirm Booking"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Price Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {date?.from && date?.to ? (
                  <>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{differenceInDays(date.to, date.from) + 1} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Guests:</span>
                      <span>{guests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base price:</span>
                      <span>Rp 500,000 / day</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>Rp {((differenceInDays(date.to, date.from) + 1) * 500000 * guests).toLocaleString()}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <p>Select dates to see price details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
