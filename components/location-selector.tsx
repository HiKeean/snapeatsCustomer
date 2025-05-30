"use client"

import { useState, useEffect } from "react"
import { MapPin, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Location {
  name: string
  address: string
  latitude: number
  longitude: number
}

export function LocationSelector() {
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Fungsi untuk mendapatkan lokasi pengguna
  const getUserLocation = () => {
    setIsLoading(true)
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError("Your browser doesn't support geolocation")
      setIsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          
          // Gunakan reverse geocoding untuk mendapatkan alamat
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          )

          if (!response.ok) throw new Error("Failed to get address")

          const data = await response.json()

          // Buat objek lokasi dari hasil geocoding
          const location: Location = {
            name: data.address.suburb || data.address.town || data.address.city || "Current Location",
            address: [data.address.road, data.address.suburb, data.address.city, data.address.state]
              .filter(Boolean)
              .join(", "),
            latitude,
            longitude,
          }

          // Simpan di localStorage
          localStorage.setItem("userLocation", JSON.stringify(location))

          // Update state
          setUserLocation(location)
          setLocationError(null)
        } catch (error) {
          console.error("Error getting location:", error)
          setLocationError("Failed to get your current address. Please try again.")
        } finally {
          setIsLoading(false)
        }
      },
      (error) => {
        console.error("Geolocation error:", error)

        let errorMessage = "Failed to get your location"
        if (error.code === 1) {
          errorMessage = "Location access denied. Please enable location services to use this app."
        } else if (error.code === 2) {
          errorMessage = "Location unavailable. Please try again later."
        } else if (error.code === 3) {
          errorMessage = "Location request timed out. Please try again."
        }

        setLocationError(errorMessage)
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  // Cek localStorage saat komponen dimount
  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation")

    if (savedLocation) {
      // Gunakan lokasi yang tersimpan
      setUserLocation(JSON.parse(savedLocation))
      setIsLoading(false)
    } else {
      // Dapatkan lokasi pengguna jika tidak ada di localStorage
      getUserLocation()
    }
  }, [])

  return (
    <div className="w-full bg-white dark:bg-secondary py-2 px-4 border-b">
      {locationError ? (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Location Required</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{locationError}</p>
            <Button onClick={getUserLocation} className="mt-2 w-full sm:w-auto">
              Enable Location
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex items-start">
          <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
          <div className="flex-1 text-left">
            {isLoading ? (
              <>
                <p className="font-medium text-sm flex items-center">
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Getting your location...
                </p>
                <p className="text-xs text-muted-foreground">Please wait</p>
              </>
            ) : (
              <>
                <p className="font-medium text-sm">{userLocation?.name || "Location not available"}</p>
                <p className="text-xs text-muted-foreground">
                  {userLocation?.address || "Please enable location services"}
                </p>
              </>
            )}
          </div>
          <Button variant="ghost" size="sm" className="ml-2 px-2 h-8" onClick={getUserLocation} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  )
}
