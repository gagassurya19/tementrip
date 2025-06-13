import { NextResponse } from "next/server"
import { destinations } from "@/lib/data"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { destination, dates, tripType, interests } = body

    // In a real application, this would use ML/AI to generate recommendations
    // For demo purposes, we'll return a simple itinerary based on the destination

    const matchingDestinations = destinations.filter(
      (d) => d.city.toLowerCase() === destination.toLowerCase() || d.state.toLowerCase() === destination.toLowerCase(),
    )

    if (matchingDestinations.length === 0) {
      return NextResponse.json({ error: "No destinations found for the given location" }, { status: 404 })
    }

    // Create a simple itinerary
    const itinerary = {
      destination: matchingDestinations[0].city,
      days: [
        {
          day: 1,
          activities: [
            {
              time: "09:00 AM",
              title: `Visit ${matchingDestinations[0].title}`,
              description: matchingDestinations[0].description,
              location: matchingDestinations[0].location,
            },
            {
              time: "12:00 PM",
              title: "Lunch at local restaurant",
              description: "Enjoy local cuisine",
              location: null,
            },
            {
              time: "03:00 PM",
              title: "Explore city center",
              description: "Walk around and discover local attractions",
              location: null,
            },
          ],
        },
        {
          day: 2,
          activities: [
            {
              time: "10:00 AM",
              title: "Cultural tour",
              description: "Learn about local culture and traditions",
              location: null,
            },
            {
              time: "02:00 PM",
              title: "Shopping time",
              description: "Visit local markets and shops",
              location: null,
            },
          ],
        },
      ],
    }

    return NextResponse.json({
      success: true,
      itinerary,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate itinerary" }, { status: 500 })
  }
}
