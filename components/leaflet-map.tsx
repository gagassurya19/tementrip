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
  imageUrl?: string
  description?: string
  totalScore?: number
  reviewsCount?: number
}

interface LeafletMapProps {
  locations?: MapLocation[]
  center?: { lat: number; lng: number }
  zoom?: number
  className?: string
  selectedLocation?: MapLocation | null
  onLocationSelect?: (location: MapLocation) => void
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
  className = "h-full w-full rounded-lg overflow-hidden",
  selectedLocation = null,
  onLocationSelect,
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const markersRef = useRef<{[key: string]: L.Marker}>({})
  const tooltipRef = useRef<L.Popup | null>(null)

  // Load Leaflet library and CSS
  useEffect(() => {
    let isMounted = true

    const loadLeaflet = async () => {
      if (typeof window === "undefined") return

      try {
        // Import Leaflet CSS
        const leafletCSS = document.createElement('link')
        leafletCSS.rel = 'stylesheet'
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        leafletCSS.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
        leafletCSS.crossOrigin = ''
        
        if (!document.head.querySelector('link[href*="leaflet.css"]')) {
          document.head.appendChild(leafletCSS)
        }

        // Add custom popup styles
        const customStyles = document.createElement('style')
        customStyles.innerHTML = `
          .custom-popup .leaflet-popup-content {
            padding: 0 !important;
            margin: 0 !important;
          }
          .custom-popup .leaflet-popup-content-wrapper {
            border-radius: 12px !important;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
            overflow: hidden;
          }
          .custom-popup .leaflet-popup-tip {
            background: white !important;
          }
        `
        if (!document.head.querySelector('style[data-leaflet-custom]')) {
          customStyles.setAttribute('data-leaflet-custom', 'true')
          document.head.appendChild(customStyles)
        }

        // Import Leaflet library
        const L = await import("leaflet")

        if (!isMounted) return

        // Fix for Leaflet marker icons in Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl

        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        })

        if (isMounted) {
          setIsMapLoaded(true)
        }
      } catch (error) {
        console.error("Error loading Leaflet:", error)
      }
    }

    loadLeaflet()

    return () => {
      isMounted = false
    }
  }, [])

  // Initialize map when Leaflet is loaded
  useEffect(() => {
    if (!isMapLoaded || !mapContainerRef.current || mapRef.current) return

    const initializeMap = async () => {
      try {
        const L = await import("leaflet")
        
        if (!mapContainerRef.current) return

        // Initialize the map
        mapRef.current = L.map(mapContainerRef.current, {
          center: [center.lat, center.lng],
          zoom: zoom,
          zoomControl: true,
          attributionControl: true,
        })

        // Add OpenStreetMap tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapRef.current)

        // Add markers for each location
        const markers: L.Marker[] = []
        markersRef.current = {}
        
        locations.forEach((location) => {
          if (mapRef.current && location.placeId) {
            const marker = L.marker([location.lat, location.lng]).addTo(mapRef.current)

            // Create custom popup content with image and details
            const popupContent = `
              <div style="max-width: 300px; min-width: 250px; padding: 10px;">
                ${location.imageUrl ? `
                  <img 
                    src="${location.imageUrl}" 
                    alt="${location.title || 'Destination'}"
                    style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;"
                    onerror="this.style.display='none'"
                  />
                ` : ''}
                <div>
                  <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #333;">
                    ${location.title || 'Unknown Location'}
                  </h3>
                  ${location.description ? `
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: #666; line-height: 1.4;">
                      ${location.description.length > 100 ? location.description.substring(0, 100) + '...' : location.description}
                    </p>
                  ` : ''}
                  ${location.totalScore ? `
                    <div style="margin: 8px 0; font-size: 12px; color: #555;">
                      <span style="font-weight: bold;">★ ${location.totalScore}</span>
                      <span style="color: #888; margin-left: 5px;">
                        (${location.reviewsCount?.toLocaleString() || 0} reviews)
                      </span>
                    </div>
                  ` : ''}
                </div>
              </div>
            `

            marker.bindPopup(popupContent, {
              maxWidth: 320,
              minWidth: 250,
              className: 'custom-popup'
            })

            // Add click handler for marker selection
            marker.on('click', () => {
              if (onLocationSelect) {
                onLocationSelect(location)
              }
            })

            markers.push(marker)
            markersRef.current[location.placeId] = marker
          }
        })

        // If there are multiple locations, fit the map to show all markers
        if (locations.length > 1 && mapRef.current) {
          const group = new L.FeatureGroup(markers)
          mapRef.current.fitBounds(group.getBounds().pad(0.1))
        }

        // Force a map invalidation to ensure proper rendering
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize()
          }
        }, 100)

      } catch (error) {
        console.error("Error initializing map:", error)
      }
    }

    initializeMap()
  }, [isMapLoaded, center.lat, center.lng, zoom, locations])

  // Handle selected location changes (when card is clicked)
  useEffect(() => {
    if (!selectedLocation || !mapRef.current || !selectedLocation.placeId) return

    const marker = markersRef.current[selectedLocation.placeId]
    if (marker) {
      // Center the map on the selected location
      mapRef.current.setView([selectedLocation.lat, selectedLocation.lng], Math.max(zoom, 12), {
        animate: true,
        duration: 1
      })
      
      // Open the popup with a slight delay to ensure the map has moved
      setTimeout(() => {
        marker.openPopup()
      }, 500)
    }
  }, [selectedLocation, zoom])

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
    if (!mapRef.current) return

    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize()
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isMapLoaded])

  if (!isMapLoaded) {
    return <MapPlaceholder />
  }

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
