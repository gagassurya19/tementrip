"use client"

import Image from "next/image"
import Link from "next/link"
import { Plane } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Destination } from "@/lib/types"
import { useState } from "react"

interface DestinationCardProps {
  destination: Destination
}

export function DestinationCard({ destination }: DestinationCardProps) {
  const [imageError, setImageError] = useState(false)

  // Use a fallback image if the original image fails to load
  const imageSrc = imageError
    ? "/placeholder.svg?height=200&width=300"
    : destination.imageUrl || "/placeholder.svg?height=200&width=300"

  return (
    <Link href={`/destinations/${destination.placeId}`}>
      <Card className="overflow-hidden transition-all hover:shadow-lg">
        <div className="relative h-48 w-full">
          <Image
            src={imageSrc || "/placeholder.svg"}
            alt={destination.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            priority={false}
            loading="lazy"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg">{destination.city}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <Plane size={16} />
            <span>{destination.tripDuration} Days Trip</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
