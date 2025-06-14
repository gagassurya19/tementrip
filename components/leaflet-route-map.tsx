"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"
import dynamic from "next/dynamic"

// Define types
interface MapLocation {
  lat: number
  lng: number
  title?: string
  placeId?: string
  description?: string
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
      <MapPin className="h-12 w-12 text-blue-500 mb-2 animate-pulse" />
      <h3 className="text-lg font-medium">Loading route map...</h3>
    </div>
  )
}

// Simple fallback map component for when interactive map fails
function SimpleRouteMap({ locations, showRoute, className }: { locations: MapLocation[], showRoute: boolean, className: string }) {
  return (
    <div className={className}>
      <div className="h-full w-full bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-blue-500 text-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              🗺️ Your Route Map (Fallback Mode)
            </h3>
            <div className="text-sm bg-blue-600 px-2 py-1 rounded">
              {locations.length} stops
            </div>
          </div>
        </div>

        {/* Route visualization */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {locations.map((location, index) => (
              <div key={index} className="relative">
                {/* Connecting line */}
                {showRoute && index < locations.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-8 bg-blue-300 z-0"></div>
                )}
                
                {/* Location card */}
                <div className="relative bg-white rounded-lg shadow-sm border border-blue-200 p-4 z-10">
                  <div className="flex items-start gap-3">
                    {/* Marker */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                      index === 0 ? 'bg-green-500' : 
                      index === locations.length - 1 ? 'bg-red-500' : 
                      'bg-blue-500'
                    }`}>
                      {index === 0 ? '🚩' : index === locations.length - 1 ? '🏁' : index + 1}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{location.title || 'Unknown Location'}</h4>
                        {index === 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">START</span>}
                        {index === locations.length - 1 && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">END</span>}
                      </div>
                      
                      {location.description && (
                        <p className="text-sm text-gray-600 mb-2">{location.description}</p>
                      )}
                      
                      <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-3 text-center">
          <p className="text-sm text-gray-600 mb-2">
            {showRoute ? '🚗 Route mode enabled' : '📍 Marker mode'}
          </p>
          <p className="text-xs text-gray-500">
            Interactive map temporarily unavailable - showing route details
          </p>
        </div>
      </div>
    </div>
  )
}

// Create the actual implementation that will be dynamically loaded
function LeafletRouteMapComponent({
  locations = [],
  center = { lat: -6.2088, lng: 106.8456 },
  zoom = 10,
  showRoute = false,
  className = "h-full w-full rounded-lg overflow-hidden",
}: LeafletRouteMapProps) {
  const mapRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)

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
        if (!document.head.querySelector('style[data-leaflet-route-custom]')) {
          customStyles.setAttribute('data-leaflet-route-custom', 'true')
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
        if (isMounted) {
          setMapError(true)
        }
      }
    }

    loadLeaflet()

    return () => {
      isMounted = false
    }
  }, [])

  // Initialize map when Leaflet is loaded
  useEffect(() => {
    if (!isMapLoaded || !mapContainerRef.current || mapRef.current || mapError) return

    const initializeMap = async () => {
      try {
        const L = await import("leaflet")
        
        if (!mapContainerRef.current) return

        // Calculate center from locations if not provided
        const mapCenter = center
        if (locations.length > 0 && (center.lat === -6.2088 && center.lng === 106.8456)) {
          // Use first location as center if using default center
          mapCenter.lat = locations[0].lat
          mapCenter.lng = locations[0].lng
        }

        // Initialize the map
        mapRef.current = L.map(mapContainerRef.current, {
          center: [mapCenter.lat, mapCenter.lng],
          zoom: zoom,
          zoomControl: true,
          attributionControl: true,
        })

        // Add OpenStreetMap tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapRef.current)

        // Add markers for each location with route-specific styling
        const markers: any[] = []
        
        locations.forEach((location, index) => {
          if (mapRef.current) {
            // Create different marker icons based on position in route
            let markerIcon
            if (index === 0) {
              // Green start marker
              markerIcon = L.divIcon({
                className: 'custom-marker-start',
                html: `
                  <div style="
                    background-color: #16a34a; 
                    width: 36px; 
                    height: 36px; 
                    border-radius: 50% 50% 50% 0; 
                    transform: rotate(-45deg); 
                    border: 3px solid white;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  ">
                    <div style="
                      color: white; 
                      font-weight: bold; 
                      font-size: 18px; 
                      transform: rotate(45deg);
                    ">🚩</div>
                  </div>
                `,
                iconSize: [36, 36],
                iconAnchor: [18, 36],
              })
            } else if (index === locations.length - 1) {
              // Red end marker
              markerIcon = L.divIcon({
                className: 'custom-marker-end',
                html: `
                  <div style="
                    background-color: #dc2626; 
                    width: 36px; 
                    height: 36px; 
                    border-radius: 50% 50% 50% 0; 
                    transform: rotate(-45deg); 
                    border: 3px solid white;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  ">
                    <div style="
                      color: white; 
                      font-weight: bold; 
                      font-size: 18px; 
                      transform: rotate(45deg);
                    ">🏁</div>
                  </div>
                `,
                iconSize: [36, 36],
                iconAnchor: [18, 36],
              })
            } else {
              // Blue numbered waypoint markers
              markerIcon = L.divIcon({
                className: 'custom-marker-waypoint',
                html: `
                  <div style="
                    background-color: #2563eb; 
                    width: 32px; 
                    height: 32px; 
                    border-radius: 50% 50% 50% 0; 
                    transform: rotate(-45deg); 
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  ">
                    <div style="
                      color: white; 
                      font-weight: bold; 
                      font-size: 14px; 
                      transform: rotate(45deg);
                    ">${index}</div>
                  </div>
                `,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
              })
            }

            const marker = L.marker([location.lat, location.lng], { icon: markerIcon }).addTo(mapRef.current)

            // Create custom popup content
            const popupContent = `
              <div style="max-width: 280px; min-width: 220px; padding: 12px;">
                <div>
                  <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #333;">
                    ${location.title || 'Unknown Location'}
                    ${index === 0 ? ' <span style="background: #16a34a; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">START</span>' : 
                      index === locations.length - 1 ? ' <span style="background: #dc2626; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">END</span>' :
                      ` <span style="background: #2563eb; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">STOP ${index}</span>`}
                  </h3>
                  ${location.description ? `
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: #666; line-height: 1.4;">
                      ${location.description.length > 80 ? location.description.substring(0, 80) + '...' : location.description}
                    </p>
                  ` : ''}
                  <div style="font-size: 11px; color: #666; background: #f3f4f6; padding: 4px 8px; border-radius: 4px; margin-top: 8px;">
                    📍 ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}
                  </div>
                </div>
              </div>
            `

            marker.bindPopup(popupContent, {
              maxWidth: 300,
              minWidth: 220,
              className: 'custom-popup route-waypoint'
            })

            markers.push(marker)
          }
        })

        // Add route line if requested and we have multiple locations
        if (showRoute && locations.length > 1) {
          const routeCoords = locations.map(loc => [loc.lat, loc.lng] as [number, number])
          
          // Create a styled polyline for the route
          L.polyline(routeCoords, {
            color: '#3b82f6',
            weight: 4,
            opacity: 0.8,
            dashArray: '10, 5',
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(mapRef.current)

          // Add direction arrows along the route
          for (let i = 0; i < routeCoords.length - 1; i++) {
            const start = routeCoords[i]
            const end = routeCoords[i + 1]
            const midLat = (start[0] + end[0]) / 2
            const midLng = (start[1] + end[1]) / 2
            
            // Calculate bearing for arrow direction
            const bearing = Math.atan2(end[1] - start[1], end[0] - start[0]) * 180 / Math.PI
            
            const arrowIcon = L.divIcon({
              className: 'route-arrow',
              html: `
                <div style="
                  width: 0; 
                  height: 0; 
                  border-left: 6px solid transparent;
                  border-right: 6px solid transparent;
                  border-bottom: 12px solid #3b82f6;
                  transform: rotate(${bearing + 90}deg);
                  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
                "></div>
              `,
              iconSize: [12, 12],
              iconAnchor: [6, 6],
            })
            
            L.marker([midLat, midLng], { icon: arrowIcon }).addTo(mapRef.current)
          }
        }

        // Fit bounds to show all markers if we have multiple locations
        if (locations.length > 1 && mapRef.current) {
          const group = new L.FeatureGroup(markers)
          mapRef.current.fitBounds(group.getBounds().pad(0.1))
        } else if (locations.length === 1) {
          // For single location, center on it
          mapRef.current.setView([locations[0].lat, locations[0].lng], Math.max(zoom, 12))
        }

        // Force a map invalidation to ensure proper rendering
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize()
          }
        }, 100)

      } catch (error) {
        console.error("Error initializing route map:", error)
        setMapError(true)
      }
    }

    initializeMap()
  }, [isMapLoaded, center.lat, center.lng, zoom, locations, showRoute])

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

  // Show error fallback if map failed to load
  if (mapError) {
    return <SimpleRouteMap locations={locations} showRoute={showRoute} className={className} />
  }

  // Show loading placeholder while Leaflet is loading
  if (!isMapLoaded) {
    return <MapPlaceholder />
  }

  return (
    <div className={className}>
      {locations.length === 0 ? (
        <div className="h-full w-full bg-gray-100 flex flex-col items-center justify-center p-4 border rounded-lg">
          <MapPin className="h-12 w-12 text-blue-500 mb-2" />
          <h3 className="text-lg font-medium">No locations to display</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add destinations to see them on the route map
          </p>
        </div>
      ) : (
        <div className="relative h-full w-full">
          <div ref={mapContainerRef} className="h-full w-full" />
          
          {/* Route info overlay */}
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium">Start</span>
              </div>
              {locations.length > 2 && (
                <>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs font-medium">{locations.length - 2} Stops</span>
                  </div>
                </>
              )}
              {locations.length > 1 && (
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs font-medium">End</span>
                </div>
              )}
              {showRoute && locations.length > 1 && (
                <div className="text-xs text-blue-600 font-medium">🗺️ Route</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Dynamically import the LeafletRouteMapComponent with SSR disabled
export const LeafletRouteMap = dynamic(() => Promise.resolve(LeafletRouteMapComponent), {
  ssr: false,
  loading: () => <MapPlaceholder />,
})
