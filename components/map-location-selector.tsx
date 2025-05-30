"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Crosshair, MapPin } from "lucide-react"
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api"

interface MapLocationSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectLocation: (location: {
    name: string
    address: string
    latitude: number
    longitude: number
  }) => void
  initialLocation?: {
    latitude: number
    longitude: number
  }
}

interface PlacePrediction {
  description: string
  place_id: string
  structured_formatting?: {
    main_text: string
    secondary_text: string
  }
}

// const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ["places"]
const libraries: ["places"] = ["places"]

export function MapLocationSelector({ isOpen, onClose, onSelectLocation, initialLocation }: MapLocationSelectorProps) {
  const [mapCenter, setMapCenter] = useState({
    lat: initialLocation?.latitude || -6.174623,
    lng: initialLocation?.longitude || 106.794387,
  })
  const [markerPosition, setMarkerPosition] = useState({
    lat: initialLocation?.latitude || -6.174623,
    lng: initialLocation?.longitude || 106.794387,
  })
  const [address, setAddress] = useState("")
  const mapRef = useRef<any>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [predictions, setPredictions] = useState<PlacePrediction[]>([])
  const [showPredictions, setShowPredictions] = useState(false)

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBT04DBevaxBwh5OgG4yJ9roE909mnkT7E",
    libraries,
  })

  // Initialize the map
  const onMapLoad = (map: any) => {
    mapRef.current = map
  }

  // Get predictions when search query changes
  useEffect(() => {
    if (!isLoaded || !window.google || !searchQuery.trim()) {
      setPredictions([])
      setShowPredictions(false)
      return
    }

    const service = new window.google.maps.places.AutocompleteService()
    service.getPlacePredictions(
      {
        input: searchQuery,
        componentRestrictions: { country: "id" },
      },
      (predictions:any, status:any) => {
        if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
          setPredictions([])
          setShowPredictions(false)
          return
        }

        setPredictions(predictions)
        setShowPredictions(true)
      },
    )
  }, [searchQuery, isLoaded])

  // Handle prediction selection
  const handlePredictionSelect = (placeId: string) => {
    if (!isLoaded || !window.google) return

    const placesService = new window.google.maps.places.PlacesService(mapRef.current)
    placesService.getDetails(
      {
        placeId: placeId,
        fields: ["name", "formatted_address", "geometry"],
      },
      (place:any, status:any) => {
        if (status !== window.google.maps.places.PlacesServiceStatus.OK || !place || !place.geometry) {
          console.error("Error fetching place details")
          return
        }

        const newPosition = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        }

        // Update marker and center
        setMarkerPosition(newPosition)
        setMapCenter(newPosition)

        // Update address
        setAddress(place.formatted_address || place.name || "")

        // Pan to the location
        if (mapRef.current) {
          mapRef.current.panTo(newPosition)
          mapRef.current.setZoom(17) // Zoom in a bit
        }

        // Clear predictions
        setShowPredictions(false)
        setSearchQuery(place.name || "")
      },
    )
  }

  // Get address from coordinates using reverse geocoding
  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    if (!isLoaded || !window.google) return

    const geocoder = new window.google.maps.Geocoder()

    try {
      const response = await geocoder.geocode({
        location: { lat, lng },
      })

      if (response.results && response.results.length > 0) {
        setAddress(response.results[0].formatted_address)
      } else {
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      }
    } catch (error) {
      console.error("Error getting address:", error)
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    }
  }

  // Handle map click
  const handleMapClick = (e: any) => {
    if (e.latLng) {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()

      setMarkerPosition({ lat, lng })
      getAddressFromCoordinates(lat, lng)
    }
  }

  // Handle marker drag
  const handleMarkerDragEnd = (e: any) => {
    if (e.latLng) {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()

      setMarkerPosition({ lat, lng })
      getAddressFromCoordinates(lat, lng)
    }
  }

  // Get user's current location
  const getCurrentLocation = () => {
    setIsGettingLocation(true)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude

          setMapCenter({ lat, lng })
          setMarkerPosition({ lat, lng })
          getAddressFromCoordinates(lat, lng)

          if (mapRef.current) {
            mapRef.current.panTo({ lat, lng })
            mapRef.current.setZoom(17) // Zoom in a bit
          }

          setIsGettingLocation(false)
        },
        (error) => {
          console.error("Error getting current location:", error)
          setIsGettingLocation(false)
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
      )
    } else {
      console.error("Geolocation is not supported by this browser.")
      setIsGettingLocation(false)
    }
  }

  // Save location
  const handleSaveLocation = () => {
    onSelectLocation({
      name: address.split(",")[0] || "Selected Location",
      address: address,
      latitude: markerPosition.lat,
      longitude: markerPosition.lng,
    })
    onClose()
  }

  // Update address when marker position changes
  useEffect(() => {
    if (isLoaded && markerPosition) {
      getAddressFromCoordinates(markerPosition.lat, markerPosition.lng)
    }
  }, [isLoaded, markerPosition])

  // Load initial location
  useEffect(() => {
    if (initialLocation) {
      setMapCenter({
        lat: initialLocation.latitude,
        lng: initialLocation.longitude,
      })
      setMarkerPosition({
        lat: initialLocation.latitude,
        lng: initialLocation.longitude,
      })

      // Get address for initial location
      if (isLoaded) {
        getAddressFromCoordinates(initialLocation.latitude, initialLocation.longitude)
      }
    }
  }, [initialLocation, isLoaded])

  // Handle click outside search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        // Don't hide predictions if clicking on a prediction
        const target = event.target as HTMLElement
        if (target.closest(".prediction-item")) {
          return
        }
        setShowPredictions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  if (loadError) {
    return <div>Error loading maps</div>
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 max-h-[90vh] overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>Pilih Lokasi</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Search input - now outside the map */}
        <div className="p-4 border-b relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </div>
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Cari lokasi..."
              className="pl-10 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (predictions.length > 0) {
                  setShowPredictions(true)
                }
              }}
            />
          </div>

          {/* Custom search predictions dropdown */}
          {showPredictions && predictions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 mx-4 bg-white border rounded-md shadow-lg z-50 max-h-[300px] overflow-y-auto">
              {predictions.map((prediction) => (
                <div
                  key={prediction.place_id}
                  className="prediction-item p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 flex items-start"
                  onClick={() => handlePredictionSelect(prediction.place_id)}
                >
                  <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    {prediction.structured_formatting ? (
                      <>
                        <div className="font-medium">{prediction.structured_formatting.main_text}</div>
                        <div className="text-sm text-muted-foreground">
                          {prediction.structured_formatting.secondary_text}
                        </div>
                      </>
                    ) : (
                      <div>{prediction.description}</div>
                    )}
                  </div>
                </div>
              ))}
              <div className="p-2 text-right text-xs text-gray-500 border-t">powered by Google</div>
            </div>
          )}
        </div>

        <div className="relative">
          {/* Map */}
          <div className="h-[350px] w-full">
            {isLoaded && (
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={mapCenter}
                zoom={15}
                onClick={handleMapClick}
                onLoad={onMapLoad}
                options={{
                  fullscreenControl: false,
                  streetViewControl: false,
                  mapTypeControl: false,
                  zoomControl: true,
                  zoomControlOptions: {
                    position: window.google?.maps.ControlPosition.RIGHT_TOP,
                  },
                  gestureHandling: "greedy", // This enables one-finger panning on mobile
                }}
              >
                <Marker position={markerPosition} draggable={true} onDragEnd={handleMarkerDragEnd} />
              </GoogleMap>
            )}
          </div>

          {/* Current location button */}
          <div className="absolute bottom-4 right-4 z-10">
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full bg-white shadow-md"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
            >
              <Crosshair className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Address display */}
        <div className="p-4 text-sm border-t">
          <div className="font-medium mb-1">Alamat:</div>
          <div className="text-muted-foreground">{address || "Mencari alamat..."}</div>
        </div>

        {/* Action buttons */}
        <div className="p-4 flex justify-between border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveLocation} className="bg-[#d6246e] hover:bg-[#c01e61]">
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
