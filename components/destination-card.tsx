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
      <Card className="overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02] bg-white rounded-2xl shadow-md border-0">
        <div className="relative h-80 w-full">
          <Image
            src={imageSrc || "/placeholder.svg"}
            alt={destination.title}
            fill
            className="object-cover rounded-t-2xl"
            onError={() => setImageError(true)}
            priority={false}
            loading="lazy"
          />
        </div>
        <CardContent className="p-5">
          <h3 className="text-sm text-gray-800 mb-3">{destination.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Plane size={16} className="text-brand-primary" />
            <span className="font-medium">{destination.tripDuration} Days Trip</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
