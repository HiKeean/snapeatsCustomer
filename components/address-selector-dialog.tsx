"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Navigation, Map, Search, BookmarkIcon } from "lucide-react"
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api"
// import type { google } from "googlemaps"

interface AddressSelectorDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelectAddress: (address: any) => void
}

interface SavedAddress {
  id: string
  name: string
  address: string
  icon?: string
}

interface UserLocation {
  name: string
  address: string
  latitude: number
  longitude: number
}

const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ["places"]

export function AddressSelectorDialog({ isOpen, onClose, onSelectAddress }: AddressSelectorDialogProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([
    {
      id: "bca",
      name: "bca finance",
      address:
        "Wisma BCA Pd. Indah, Jl. Metro Pondok Indah No.10 Lt 2, Pd. Pinang, Kec. Kby. Lama, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12310, Indonesia",
      icon: "bookmark",
    },
    {
      id: "work",
      name: "Work",
      address:
        "WTC Mangga Dua, Jl. Mangga Dua Raya No.5 Lt.3, RW.5, Ancol, Kec. Pademangan, Jkt Utara, Daerah Khusus Ibukota Jakarta 14430, Indonesia",
      icon: "briefcase",
    },
  ])

  const [recentAddresses, setRecentAddresses] = useState<SavedAddress[]>([
    {
      id: "recent1",
      name: "Jl. Tomang Utara IV No.235",
      address:
        "Jl. Tomang Utara IV No.235, RT.7/RW.10, Tomang, Kec. Grogol petamburan, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11440, Indonesia",
    },
    {
      id: "recent2",
      name: "Jl. Kemanggisan Ilir III No.12",
      address:
        "Jl. Kemanggisan Ilir III No.12, Palmerah, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11480, Indonesia",
    },
  ])

    const [showMap, setShowMap] = useState(false)
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
    const [mapCenter, setMapCenter] = useState({ lat: -6.2, lng: 106.8 })
    const [selectedLocation, setSelectedLocation] = useState<any>(null)
    const libraries: ["places"] = ["places"]

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBT04DBevaxBwh5OgG4yJ9roE909mnkT7E",
    libraries: libraries,
  })

  useEffect(() => {
    // Load user location from localStorage
    const storedLocation = localStorage.getItem("userLocation")
    if (storedLocation) {
      try {
        const parsedLocation = JSON.parse(storedLocation)
        setUserLocation(parsedLocation)
      } catch (error) {
        console.error("Error parsing user location:", error)
      }
    }
  }, [])

  const handleUseCurrentLocation = () => {
    if (userLocation) {
      onSelectAddress(userLocation)
      onClose()
    }
  }

  const handleSelectOnMap = () => {
    setShowMap(true)
  }

  const handleSelectSavedAddress = (address: SavedAddress) => {
    onSelectAddress({
      name: address.name,
      address: address.address,
    })
    onClose()
  }

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      setSelectedLocation({ lat, lng })

      // In a real app, you would use the Google Maps Geocoding API to get the address from coordinates
      // For now, we'll just use the coordinates as the address
      const newLocation = {
        name: "Selected Location",
        address: `Selected location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        latitude: lat,
        longitude: lng,
      }

      setSelectedLocation(newLocation)
    }
  }

  const confirmMapSelection = () => {
    if (selectedLocation) {
      onSelectAddress(selectedLocation)
      setShowMap(false)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select location</DialogTitle>
        </DialogHeader>

        {!showMap ? (
          <>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                type="text"
                placeholder="Search location"
                className="pl-10 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start" onClick={handleUseCurrentLocation}>
                <Navigation className="h-4 w-4 mr-2" />
                Your current location
              </Button>
              <Button variant="outline" className="justify-start" onClick={handleSelectOnMap}>
                <Map className="h-4 w-4 mr-2" />
                Select on map
              </Button>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Saved addresses</h3>
                <Button variant="link" className="text-primary p-0">
                  See all
                </Button>
              </div>
              <div className="space-y-3 mt-3">
                {savedAddresses.map((address) => (
                  <div
                    key={address.id}
                    className="border rounded-lg p-3 cursor-pointer hover:border-primary"
                    onClick={() => handleSelectSavedAddress(address)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-muted-foreground">
                        {address.icon === "bookmark" ? (
                          <BookmarkIcon className="h-5 w-5" />
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs">💼</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{address.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{address.address}</p>
                      </div>
                      <button className="text-muted-foreground">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium">Recent addresses</h3>
              <div className="space-y-3 mt-3">
                {recentAddresses.map((address) => (
                  <div
                    key={address.id}
                    className="border rounded-lg p-3 cursor-pointer hover:border-primary"
                    onClick={() => handleSelectSavedAddress(address)}
                  >
                    <h4 className="font-medium">{address.name}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{address.address}</p>
                    <div className="flex items-center mt-2">
                      <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                        <span className="text-xs">🕒</span>
                      </div>
                      <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-xs">📍</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col h-[400px]">
            {isLoaded ? (
              <>
                <div className="flex-1">
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={mapCenter}
                    zoom={15}
                    onClick={handleMapClick}
                  >
                    {selectedLocation && (
                      <Marker position={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }} />
                    )}
                  </GoogleMap>
                </div>
                <div className="mt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setShowMap(false)}>
                    Back
                  </Button>
                  <Button onClick={confirmMapSelection} disabled={!selectedLocation}>
                    Confirm Location
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p>Loading map...</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
