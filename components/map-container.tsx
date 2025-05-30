"use client"

import { useState, useCallback, useEffect } from "react"
import { ArrowLeft, Compass } from "lucide-react"
import { GoogleMap, Marker, DirectionsService, DirectionsRenderer } from "@react-google-maps/api"

interface MapContainerProps {
  isLoaded: boolean
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
}

// Updated coordinates as provided
const startLocation = { lat: -6.211544, lng: 106.845172 }
const endLocation = { lat: -6.168786, lng: 106.799445 }

// Center the map between the two points
const center = {
  lat: (startLocation.lat + endLocation.lat) / 2,
  lng: (startLocation.lng + endLocation.lng) / 2,
}

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
}

export function MapContainer({ isLoaded }: MapContainerProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null)
  const [showUserMarker, setShowUserMarker] = useState(false)
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)
  const [directionsRequested, setDirectionsRequested] = useState(false)

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  // Start location icon (green)
  const startIcon = {
    url:
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="15" fill="#2ecc71" />
        <path d="M15 20l4 4 6-8" stroke="white" strokeWidth="2"/>
      </svg>
    `),
  }

  // End location icon (red)
  const endIcon = {
    url:
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="15" fill="#e74c3c" />
        <path d="M16 14v12M20 14v12M24 14v12M14 18h12" stroke="white" strokeWidth="2"/>
      </svg>
    `),
  }

  const getUserLocation = () => {
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }

          setUserLocation(userPos)
          setShowUserMarker(true)
          map.panTo(userPos)
          map.setZoom(16)
        },
        (error) => {
          console.error("Error getting user location:", error)
          alert("Could not get your location. Please check your location permissions.")
        },
      )
    } else {
      alert("Geolocation is not supported by this browser.")
    }
  }

  // Function to handle directions result
  const directionsCallback = (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
    if (result !== null && status === "OK") {
      setDirections(result)
    } else {
      console.error("Directions request failed:", status)
    }
  }

  // Request directions when the map is loaded
  useEffect(() => {
    if (isLoaded && map && !directionsRequested) {
      setDirectionsRequested(true)
    }
  }, [isLoaded, map, directionsRequested])

  return (
    <div className="relative w-full h-full bg-gray-200">
      {isLoaded ? (
        <>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={13}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={mapOptions}
          >
            {/* Request directions */}
            {directionsRequested && !directions && (
              <DirectionsService
                options={{
                  origin: startLocation,
                  destination: endLocation,
                  travelMode: google.maps.TravelMode.DRIVING,
                }}
                callback={directionsCallback}
              />
            )}

            {/* Render directions */}
            {directions && (
              <DirectionsRenderer
                options={{
                  directions: directions,
                  suppressMarkers: true, // We'll add our own custom markers
                  polylineOptions: {
                    strokeColor: "#e31902",
                    strokeWeight: 5,
                    strokeOpacity: 0.8,
                  },
                }}
              />
            )}

            {/* Start and end markers */}
            <Marker position={startLocation} icon={startIcon} />
            <Marker position={endLocation} icon={endIcon} />

            {/* User location marker */}
            {showUserMarker && userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: "#4285F4",
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: "white",
                }}
                zIndex={1000}
              />
            )}
          </GoogleMap>

          {/* Map Controls */}
          <div className="absolute top-4 left-4 z-10">
            <button className="bg-white rounded-full p-2 shadow-md">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>

          <div className="absolute bottom-32 right-4 z-10">
            <button
              className="bg-white rounded-full p-3 shadow-md hover:bg-gray-100 active:bg-gray-200 transition-colors"
              onClick={getUserLocation}
              aria-label="Find my location"
            >
              <Compass className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  )
}

