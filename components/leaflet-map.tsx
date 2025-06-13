"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"
import dynamic from "next/dynamic"

// Define types that will be used before dynamic import
interface MapLocation {
  lat: number
  lng: number
  title?: string
  placeId?: string
}

interface LeafletMapProps {
  locations?: MapLocation[]
  center?: { lat: number; lng: number }
  zoom?: number
  className?: string
}

// Create a placeholder component to show while Leaflet is loading
function MapPlaceholder() {
  return (
    <div className="h-full w-full bg-gray-100 flex flex-col items-center justify-center p-4 border rounded-lg">
      <MapPin className="h-12 w-12 text-blue-500 mb-2" />
      <h3 className="text-lg font-medium">Loading map...</h3>
    </div>
  )
}

// Create the actual implementation that will be dynamically loaded
function LeafletMapComponent({
  locations = [],
  center = { lat: -2.5489, lng: 118.0149 }, // Indonesia's approximate center
  zoom = 5,
  className = "h-[400px] w-full rounded-lg overflow-hidden",
}: LeafletMapProps) {
  const mapRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [leaflet, setLeaflet] = useState<any>(null)

  // Load Leaflet library
  useEffect(() => {
    // Only import Leaflet on the client side
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        // Fix for Leaflet marker icons in Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl

        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        })

        setLeaflet(L)
      })
    }
  }, [])

  // Initialize map when Leaflet is loaded
  useEffect(() => {
    if (!leaflet || !mapContainerRef.current || mapRef.current) return

    // Wait a moment to ensure the container is properly rendered
    const timer = setTimeout(() => {
      try {
        // Initialize the map
        mapRef.current = leaflet.map(mapContainerRef.current).setView([center.lat, center.lng], zoom)

        // Add OpenStreetMap tile layer
        leaflet
          .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          })
          .addTo(mapRef.current)

        // Add markers for each location
        locations.forEach((location) => {
          const marker = leaflet.marker([location.lat, location.lng]).addTo(mapRef.current)

          if (location.title) {
            marker.bindPopup(`<b>${location.title}</b>`).on("click", () => {
              marker.openPopup()
            })
          }
        })

        // If there are multiple locations, fit the map to show all markers
        if (locations.length > 1) {
          const bounds = leaflet.latLngBounds(locations.map((loc) => [loc.lat, loc.lng]))
          mapRef.current.fitBounds(bounds, { padding: [50, 50] })
        }

        // Force a map invalidation to ensure proper rendering
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize()
          }
        }, 250)
      } catch (error) {
        console.error("Error initializing map:", error)
      }
    }, 100)

    // Cleanup function to destroy map when component unmounts
    return () => {
      clearTimeout(timer)
    }
  }, [center, zoom, locations, leaflet])

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Handle window resize to update map size
  useEffect(() => {
    if (!leaflet || !mapRef.current) return

    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize()
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [leaflet])

  return (
    <div className={className}>
      {locations.length === 0 ? (
        <div className="h-full w-full bg-gray-100 flex flex-col items-center justify-center p-4 border rounded-lg">
          <MapPin className="h-12 w-12 text-blue-500 mb-2" />
          <h3 className="text-lg font-medium">No locations to display</h3>
        </div>
      ) : (
        <div ref={mapContainerRef} className="h-full w-full" />
      )}
    </div>
  )
}

// Dynamically import the LeafletMapComponent with SSR disabled
export const LeafletMap = dynamic(() => Promise.resolve(LeafletMapComponent), {
  ssr: false,
  loading: () => <MapPlaceholder />,
})
