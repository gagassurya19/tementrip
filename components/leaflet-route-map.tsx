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

interface LeafletRouteMapProps {
  locations?: MapLocation[]
  center?: { lat: number; lng: number }
  zoom?: number
  showRoute?: boolean
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
function LeafletRouteMapComponent({
  locations = [],
  center = { lat: -2.5489, lng: 118.0149 }, // Indonesia's approximate center
  zoom = 5,
  showRoute = false,
  className = "h-[400px] w-full rounded-lg overflow-hidden",
}: LeafletRouteMapProps) {
  const mapRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const routingControlRef = useRef<any>(null)
  const [leaflet, setLeaflet] = useState<any>(null)
  const [routingMachine, setRoutingMachine] = useState<any>(null)

  // Load Leaflet library and Routing Machine
  useEffect(() => {
    // Only import Leaflet on the client side
    if (typeof window !== "undefined") {
      Promise.all([import("leaflet"), showRoute ? import("leaflet-routing-machine") : Promise.resolve(null)]).then(
        ([L, _]) => {
          // Fix for Leaflet marker icons in Next.js
          delete (L.Icon.Default.prototype as any)._getIconUrl

          L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
            iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
            shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
          })

          setLeaflet(L)
          if (showRoute) {
            setRoutingMachine(true)
          }
        },
      )
    }
  }, [showRoute])

  // Initialize map when Leaflet is loaded
  useEffect(() => {
    if (!leaflet || !mapContainerRef.current || mapRef.current) return
    if (showRoute && !routingMachine) return

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

        // If we're not showing a route, add markers for each location
        if (!showRoute) {
          locations.forEach((location) => {
            const marker = leaflet.marker([location.lat, location.lng]).addTo(mapRef.current)

            if (location.title) {
              marker.bindPopup(`<b>${location.title}</b>`).on("click", () => {
                marker.openPopup()
              })
            }
          })
        }

        // If there are multiple locations and showRoute is true, add a route
        if (showRoute && locations.length > 1) {
          const waypoints = locations.map((loc) => leaflet.latLng(loc.lat, loc.lng))

          routingControlRef.current = leaflet.Routing.control({
            waypoints,
            routeWhileDragging: true,
            showAlternatives: false,
            fitSelectedRoutes: true,
            lineOptions: {
              styles: [{ color: "#3b82f6", opacity: 0.8, weight: 5 }],
            },
            createMarker: (i: number, waypoint: any, n: number) => {
              const marker = leaflet.marker(waypoint.latLng, {
                draggable: false,
                icon: leaflet.divIcon({
                  className: "custom-marker-icon",
                  html: `<div class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">${i + 1}</div>`,
                  iconSize: [24, 24],
                  iconAnchor: [12, 12],
                }),
              })

              if (locations[i]?.title) {
                marker.bindPopup(`<b>${locations[i].title}</b>`)
              }

              return marker
            },
          }).addTo(mapRef.current)

          // Hide the routing control panel
          const routingContainer = routingControlRef.current.getContainer()
          routingContainer.style.display = "none"
        }
        // If there are multiple locations but no route, fit bounds
        else if (locations.length > 1) {
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
  }, [center, zoom, locations, showRoute, leaflet, routingMachine])

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        if (routingControlRef.current) {
          routingControlRef.current.remove()
          routingControlRef.current = null
        }
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

// Dynamically import the LeafletRouteMapComponent with SSR disabled
export const LeafletRouteMap = dynamic(() => Promise.resolve(LeafletRouteMapComponent), {
  ssr: false,
  loading: () => <MapPlaceholder />,
})
