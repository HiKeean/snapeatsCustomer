"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Phone, MessageSquare, Navigation, Clock } from "lucide-react"
import { useStompWebSocket } from "@/hooks/use-stomp-websocket"
import { BottomNavigation } from "@/components/bottom-navigation"
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api"
// import { google } from "google-maps"

// Driver information
interface Driver {
  id: string
  name: string
  phone: string
  photo: string
  plate: string
  vehicle: string
  rating: number
  lat: number
  lng: number
}

// Location update from WebSocket
interface LocationUpdate {
  lat: number
  lng: number
  heading?: number
  speed?: number
  timestamp?: number
  estimatedTime?: number
  status?: string
}

// Map container style
const mapContainerStyle = {
  width: "100%",
  height: "100%",
}

export default function DriverTrackingPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [driver, setDriver] = useState<Driver | null>(null)
  const [estimatedTime, setEstimatedTime] = useState(15)
  const [isDriverArrived, setIsDriverArrived] = useState(false)

  // Map references
  const mapRef = useRef<google.maps.Map | null>(null)
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null)

  // Destination location (user's delivery address)
  const [destination, setDestination] = useState({
    lat: -6.2088,
    lng: 106.8456,
    address: "Your delivery address",
  })

  // Driver location
  const [driverLocation, setDriverLocation] = useState<google.maps.LatLngLiteral | null>(null)

  // Load Google Maps API
  const libraries: ["places"] = ["places"]
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY",
    libraries: libraries,
  })

  // Get WebSocket connection
  const { status: wsStatus, subscribe, send } = useStompWebSocket()

  // Map load callback
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map

    // Create directions renderer
    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true, // We'll create our own markers
        polylineOptions: {
          strokeColor: "#4285F4",
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
      })
    }
  }, [])

  // Calculate and display route
  const calculateRoute = useCallback(() => {
    if (!driverLocation || !mapRef.current) return

    const directionsService = new google.maps.DirectionsService()

    directionsService.route(
      {
        origin: driverLocation,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result:any, status:any) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          // Display the route
          if (directionsRendererRef.current) {
            directionsRendererRef.current.setDirections(result)
          }

          // Update estimated time
          if (result.routes[0]?.legs[0]?.duration) {
            setEstimatedTime(Math.ceil(result.routes[0].legs[0].duration.value / 60))
          }

          // Check if driver has arrived (within 50 meters)
          const distance = result.routes[0]?.legs[0]?.distance?.value || 0
          if (distance < 50 && !isDriverArrived) {
            setIsDriverArrived(true)
            // Redirect to completed page after a delay
            setTimeout(() => {
              router.push(`/pembeli/tracking/${orderId}/completed`)
            }, 5000)
          }
        }
      },
    )
  }, [driverLocation, destination, orderId, router, isDriverArrived])

  // Update driver location
  const updateDriverLocation = useCallback(
    (location: LocationUpdate) => {
      setDriverLocation({ lat: location.lat, lng: location.lng })

      if (location.estimatedTime) {
        setEstimatedTime(location.estimatedTime)
      }

      if (location.status === "arrived") {
        setIsDriverArrived(true)
        // Redirect to completed page after a delay
        setTimeout(() => {
          router.push(`/pembeli/tracking/${orderId}/completed`)
        }, 5000)
      }
    },
    [orderId, router],
  )

  // Load initial data and subscribe to updates
  useEffect(() => {
    if (!orderId) {
      router.push("/pembeli")
      return
    }

    // Load delivery address from localStorage
    const savedAddress = localStorage.getItem("selectedAddress")
    if (savedAddress) {
      try {
        const addressData = JSON.parse(savedAddress)
        setDestination({
          lat: addressData.lat,
          lng: addressData.lon,
          address: addressData.address,
        })
      } catch (error) {
        console.error("Error parsing saved address:", error)
      }
    }

    // Subscribe to driver location updates
    const locationUnsubscribe = subscribe(`/topic/order/${orderId}/driver/location`, (data: LocationUpdate) => {
      console.log("Driver location update:", data)
      updateDriverLocation(data)
    })

    // Subscribe to driver info updates
    const driverUnsubscribe = subscribe(`/topic/order/${orderId}/driver`, (data: Driver) => {
      console.log("Driver info update:", data)
      setDriver(data)

      // Initialize driver location if not set
      if (!driverLocation && data.lat && data.lng) {
        setDriverLocation({ lat: data.lat, lng: data.lng })
      }
    })

    // Request initial driver info
    send("/app/order/driver", { orderId })

    // Simulate driver for demo purposes
    const simulateDriver = () => {
      // Create demo driver
      const demoDriver: Driver = {
        id: "DRV123",
        name: "John Rider",
        phone: "+62812345678",
        photo: "/placeholder.svg?height=100&width=100",
        plate: "B 1234 XYZ",
        vehicle: "Honda PCX",
        rating: 4.8,
        lat: -6.21, // Starting position
        lng: 106.83,
      }

      setDriver(demoDriver)
      setDriverLocation({ lat: demoDriver.lat, lng: demoDriver.lng })

      // Simulate driver movement
      let step = 0
      const totalSteps = 20
      const interval = setInterval(() => {
        step++

        // Move driver closer to destination
        const newLat = demoDriver.lat + (destination.lat - demoDriver.lat) * (step / totalSteps)
        const newLng = demoDriver.lng + (destination.lng - demoDriver.lng) * (step / totalSteps)

        // Update driver position
        demoDriver.lat = newLat
        demoDriver.lng = newLng

        // Simulate location update
        updateDriverLocation({
          lat: newLat,
          lng: newLng,
          heading: 90,
          speed: 30,
          timestamp: Date.now(),
          estimatedTime: Math.max(1, 15 - Math.floor(step / 2)),
        })

        // Stop when reached destination
        if (step >= totalSteps) {
          clearInterval(interval)
          updateDriverLocation({
            lat: destination.lat,
            lng: destination.lng,
            status: "arrived",
          })
        }
      }, 2000)

      return () => clearInterval(interval)
    }

    // Start simulation for demo
    const cleanupSimulation = simulateDriver()

    // Cleanup subscriptions
    return () => {
      locationUnsubscribe()
      driverUnsubscribe()
      cleanupSimulation()
    }
  }, [orderId, router, subscribe, send, updateDriverLocation, destination.lat, destination.lng, driverLocation])

  // Calculate route when driver location or destination changes
  useEffect(() => {
    if (isLoaded && driverLocation) {
      calculateRoute()
    }
  }, [isLoaded, driverLocation, calculateRoute])

  // Handle call driver
  const handleCallDriver = () => {
    if (driver?.phone) {
      window.location.href = `tel:${driver.phone}`
    }
  }

  // Handle message driver
  const handleMessageDriver = () => {
    if (driver?.phone) {
      window.location.href = `sms:${driver.phone}`
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center p-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Track Your Order</h1>
        </div>
      </div>

      {/* Map Container - Takes 3/4 of the screen */}
      <div className="flex-1 w-full h-[75vh] relative">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={driverLocation || destination}
            zoom={15}
            onLoad={onMapLoad}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              fullscreenControl: true,
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }],
                },
              ],
            }}
          >
            {/* Destination Marker */}
            <Marker
              position={destination}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                scaledSize: new google.maps.Size(40, 40),
              }}
              title="Delivery Location"
            />

            {/* Driver Marker */}
            {driverLocation && (
              <Marker
                position={driverLocation}
                icon={{
                  url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                  scaledSize: new google.maps.Size(40, 40),
                }}
                title={driver?.name || "Driver"}
              />
            )}
          </GoogleMap>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Center on Driver Button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full shadow-md"
          onClick={() => {
            if (mapRef.current && driverLocation) {
              mapRef.current.panTo(driverLocation)
            }
          }}
        >
          <Navigation className="h-5 w-5" />
        </Button>

        {/* Arrived Notification */}
        {isDriverArrived && (
          <div className="absolute top-16 left-0 right-0 mx-auto w-4/5 bg-green-500 text-white p-3 rounded-lg shadow-lg text-center z-10">
            <p className="font-bold">Your driver has arrived!</p>
            <p className="text-sm">Please meet your driver outside</p>
          </div>
        )}
      </div>

      {/* Driver Info Panel - Takes 1/4 of the screen */}
      <div className="w-full h-[25vh] bg-background border-t p-4 flex flex-col">
        {driver ? (
          <>
            <div className="flex items-center gap-4 mb-3">
              <div className="relative h-16 w-16 rounded-full overflow-hidden">
                <Image src={driver.photo || "/placeholder.svg"} alt={driver.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{driver.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {driver.vehicle} • {driver.plate}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm font-medium mr-1">{driver.rating}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`h-4 w-4 ${star <= Math.round(driver.rating) ? "text-yellow-400" : "text-gray-300"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="icon" variant="outline" className="h-10 w-10 rounded-full" onClick={handleCallDriver}>
                  <Phone className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="outline" className="h-10 w-10 rounded-full" onClick={handleMessageDriver}>
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <Card className="flex-1">
              <CardContent className="p-3 flex items-center">
                <div className="mr-3">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Estimated Arrival</h3>
                  <p className="text-lg font-bold">
                    {isDriverArrived ? (
                      <span className="text-green-500">Driver has arrived!</span>
                    ) : (
                      <span>{estimatedTime} minutes</span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-2"></div>
            <p>Loading driver information...</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
