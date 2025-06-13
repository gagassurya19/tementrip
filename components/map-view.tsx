"use client"

import { useState, useCallback } from "react"
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer } from "@react-google-maps/api"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin } from "lucide-react"

const mapContainerStyle = {
  width: "100%",
  height: "100%",
}

const defaultCenter = {
  lat: -2.5489, // Indonesia's approximate center
  lng: 118.0149,
}

interface MapLocation {
  lat: number
  lng: number
  title?: string
  placeId?: string
}

interface MapViewProps {
  locations?: MapLocation[]
  center?: { lat: number; lng: number }
  zoom?: number
  showDirections?: boolean
  className?: string
}

export function MapView({
  locations = [],
  center = defaultCenter,
  zoom = 5,
  showDirections = false,
  className = "h-[400px] w-full rounded-lg overflow-hidden",
}: MapViewProps) {
  // Check if we have a valid API key
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const hasValidApiKey = apiKey && apiKey !== "YOUR_API_KEY"

  // If we don't have a valid API key, render a fallback
  if (!hasValidApiKey) {
    return <StaticMapFallback locations={locations} className={className} />
  }

  return (
    <DynamicMap
      locations={locations}
      center={center}
      zoom={zoom}
      showDirections={showDirections}
      className={className}
    />
  )
}

function StaticMapFallback({ locations, className }: { locations: MapLocation[]; className: string }) {
  return (
    <div className={`${className} bg-gray-100 flex flex-col items-center justify-center p-4 border rounded-lg`}>
      <div className="text-center mb-4">
        <MapPin className="h-12 w-12 text-blue-500 mx-auto mb-2" />
        <h3 className="text-lg font-medium">Map Preview</h3>
        <p className="text-sm text-gray-500">A Google Maps API key is required to display the interactive map.</p>
      </div>

      {locations.length > 0 && (
        <div className="w-full max-w-md">
          <h4 className="font-medium mb-2">Locations:</h4>
          <ul className="space-y-2">
            {locations.map((location, index) => (
              <li key={location.placeId || index} className="flex items-center gap-2 p-2 bg-white rounded border">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span>{location.title || `Location ${index + 1}`}</span>
                <span className="text-xs text-gray-500 ml-auto">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function DynamicMap({ locations, center, zoom, showDirections, className }: MapViewProps) {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [directions, setDirections] = useState<any | null>(null)

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  })

  const onMapLoad = useCallback(
    (map: any) => {
      if (showDirections && locations.length > 1 && window.google) {
        const directionsService = new window.google.maps.DirectionsService()

        directionsService.route(
          {
            origin: locations[0],
            destination: locations[locations.length - 1],
            waypoints: locations.slice(1, -1).map((location) => ({
              location: new window.google.maps.LatLng(location.lat, location.lng),
              stopover: true,
            })),
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              setDirections(result)
            } else {
              console.error(`Directions request failed: ${status}`)
            }
          },
        )
      }
    },
    [locations, showDirections],
  )

  if (loadError) {
    return <div className={className}>Error loading maps</div>
  }

  if (!isLoaded) {
    return <Skeleton className={className} />
  }

  return (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onLoad={onMapLoad}
        options={{
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          zoomControl: true,
        }}
      >
        {!directions &&
          locations.map((location, index) => (
            <Marker
              key={location.placeId || index}
              position={{ lat: location.lat, lng: location.lng }}
              onClick={() => setSelectedLocation(location)}
            />
          ))}

        {selectedLocation && (
          <InfoWindow
            position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
            onCloseClick={() => setSelectedLocation(null)}
          >
            <div>
              <h3 className="font-medium">{selectedLocation.title || "Location"}</h3>
            </div>
          </InfoWindow>
        )}

        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </div>
  )
}
