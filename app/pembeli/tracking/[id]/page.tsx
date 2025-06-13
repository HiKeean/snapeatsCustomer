"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Phone, MessageSquare, Navigation, MapPin, Clock, Crosshair } from "lucide-react"
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api"
import WebSocketService from "@/lib/websocket-service"
import Swal from "sweetalert2"
import { toast } from "sonner"
import { getdriverdet, getorderdet } from "@/services/transactionService"

// Driver location update from WebSocket
interface LocationUpdate {
  lat: number
  lng: number
  heading: number
  speed: number
  timestamp: string
}

// Driver information
interface Driver {
  id: string
  name: string
  phone: string
  photo: string
  plate: string
  vehicle: string
  rating: number
  status: "going_to_restaurant" | "at_restaurant" | "going_to_customer" | "arrived"
}

// Location interface
interface Location {
  lat: number
  lng: number
  address: string
}

// Order details interface
interface OrderItem {
  name: string
  quantity: number
  price?: number
}

interface OrderDetails {
  id: string
  restaurantName: string
  restaurantLocation: Location
  deliveryLocation: Location
  paymentMethod: string
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  total: number
}

export default function DriverTrackingPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  // Map state
  const mapRef = useRef<google.maps.Map | null>(null)
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null)
  const [driverLocation, setDriverLocation] = useState<google.maps.LatLngLiteral | null>(null)
  const [restaurantLocation, setRestaurantLocation] = useState<google.maps.LatLngLiteral | null>(null)
  const [deliveryLocation, setDeliveryLocation] = useState<google.maps.LatLngLiteral | null>(null)
  const [isDriverArrived, setIsDriverArrived] = useState(false)
  const [estimatedArrival, setEstimatedArrival] = useState(15)
  const [distance, setDistance] = useState<string>("Calculating...")
  const [isFollowingDriver, setIsFollowingDriver] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Driver info
  const [driver, setDriver] = useState<Driver | null>(null)

  // WebSocket state
  const [wsConnected, setWsConnected] = useState(false)
  const [wsError, setWsError] = useState<string | null>(null)

  // Order details
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [tipAmount, setTipAmount] = useState(0)
  const [selectedTip, setSelectedTip] = useState<number | null>(null)

  // Load Google Maps
  const libraries: ["places"] = ["places"]
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY",
    libraries: libraries,
  })

  // Map container style
  const mapContainerStyle = {
    width: "100%",
    height: "75vh",
  }

  // Handle map load
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map

    // Initialize directions renderer
    directionsRendererRef.current = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true, // We'll use custom markers
      preserveViewport: true, // Don't auto-fit to route
      polylineOptions: {
        strokeColor: "#3B82F6",
        strokeWeight: 5,
        strokeOpacity: 0.8,
      },
    })
  }, [])

  // Calculate and display route based on driver status
  const calculateRoute = useCallback(() => {
    if (!driverLocation || !mapRef.current || !driver) return

    const directionsService = new google.maps.DirectionsService()
    let destination: google.maps.LatLngLiteral

    // Determine destination based on driver status
    if (driver.status === "going_to_restaurant" && restaurantLocation) {
      destination = restaurantLocation
    } else if ((driver.status === "going_to_customer" || driver.status === "at_restaurant") && deliveryLocation) {
      destination = deliveryLocation
    } else {
      return // No valid destination
    }

    directionsService.route(
      {
        origin: driverLocation,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result:any, status:any) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          // Set directions on the renderer
          if (directionsRendererRef.current) {
            directionsRendererRef.current.setDirections(result)
          }

          // Calculate estimated arrival time
          const route = result.routes[0]
          if (route && route.legs.length > 0) {
            const durationInSeconds = route.legs[0].duration?.value || 0
            const durationInMinutes = Math.ceil(durationInSeconds / 60)
            setEstimatedArrival(durationInMinutes)

            // Set distance
            setDistance(route.legs[0].distance?.text || "Unknown")

            // Check if driver has arrived (less than 100 meters)
            const distanceInMeters = route.legs[0].distance?.value || 0
            if (distanceInMeters < 100 && !isDriverArrived) {
              if (driver.status === "going_to_customer") {
                setIsDriverArrived(true)
                Swal.fire({
                  title: "Driver has arrived!",
                  text: "Your order is being delivered to your doorstep.",
                  icon: "success",
                  confirmButtonText: "OK",
                })
              }
            }
          }
        } else {
          console.error("Directions request failed:", status)
        }
      },
    )
  }, [driverLocation, restaurantLocation, deliveryLocation, driver, orderId, router, isDriverArrived])

  // Update driver location from WebSocket
  const updateDriverLocation = useCallback(
    (location: LocationUpdate) => {
      setDriverLocation({
        lat: location.lat,
        lng: location.lng,
      })

      // Pan map to driver location if following is enabled
      if (mapRef.current && isFollowingDriver) {
        mapRef.current.panTo({
          lat: location.lat,
          lng: location.lng,
        })
      }
    },
    [isFollowingDriver],
  )

  // Fetch order details from API
  const fetchOrderDetails = async () => {
    try {
      const orderData = await getorderdet(orderId)
      setOrderDetails(orderData)

      // Set restaurant and delivery locations
      if (orderData.restaurantLocation) {
        setRestaurantLocation({
          lat: orderData.restaurantLocation.lat,
          lng: orderData.restaurantLocation.lng,
        })
      }

      if (orderData.deliveryLocation) {
        setDeliveryLocation({
          lat: orderData.deliveryLocation.lat,
          lng: orderData.deliveryLocation.lng,
        })
      }
    } catch (error) {
      console.error("Error fetching order details:", error)
    }
  }

  // Fetch initial driver data from API
  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        setWsError(null)

        const driverData = await getdriverdet(orderId)

        // Set driver info
        setDriver({
          id: driverData.id,
          name: driverData.name,
          phone: driverData.phone,
          photo: driverData.photo || "/placeholder.svg?height=64&width=64",
          plate: driverData.plate,
          vehicle: driverData.vehicle,
          rating: driverData.rating || 4.8,
          status: driverData.status || "going_to_restaurant",
        })

        // Set initial driver location
        if (driverData.lat && driverData.lng) {
          setDriverLocation({
            lat: driverData.lat,
            lng: driverData.lng,
          })

          // Center map on driver location
          if (mapRef.current) {
            mapRef.current.panTo({
              lat: driverData.lat,
              lng: driverData.lng,
            })
            mapRef.current.setZoom(16)
          }
        }
      } catch (error) {
        console.error("Error fetching driver data:", error)
        setWsError("Failed to load driver information")
      }
    }

    if (orderId) {
      fetchDriverData()
    }
  }, [orderId])

  // Connect to WebSocket for real-time location updates
  useEffect(() => {
    if (!orderId || !driver) return

    const wsService = WebSocketService.getInstance()
    let locationSubscription: { unsubscribe: () => void } | null = null
    let statusSubscription: { unsubscribe: () => void } | null = null

    const connectAndSubscribe = async () => {
      try {
        // Connect to WebSocket
        await wsService.connect()
        setWsConnected(true)
        setWsError(null)

        // Subscribe to driver location updates
        locationSubscription = await wsService.subscribe(`/topic/transaction/${orderId}/location`, (message) => {
          console.log("Received driver location update:", message)
          updateDriverLocation(message)
        })

        // Subscribe to order status updates
        statusSubscription = await wsService.subscribe(`/topic/order/${orderId}/status`, (message: any) => {
          console.log("Received order status update:", message)
          setIsLoading(false)

          // Update driver status based on the message
          if (message.driver && driver) {
            setDriver({
              id: message.driver.id,
              name: message.driver.name,
              phone: message.driver.phone,
              photo: message.driver.photo || "/placeholder.svg?height=64&width=64",
              plate: message.driver.platNomor,
              vehicle: "motor",
              rating: message.driver.rating == null? 5 : message.driver.rating || 4.8,
              status: message.status == "driver_assigned" ? "at_restaurant" : message.status == "on_the_way"? "going_to_customer" : message.status
            })
          }
        })
      } catch (error) {
        console.error("WebSocket connection error:", error)
        setWsConnected(false)
        setWsError("Failed to connect to real-time updates. Retrying...")

        // Retry connection after 5 seconds
        setTimeout(connectAndSubscribe, 5000)
      }
    }

    // Connect to WebSocket only after we have driver data
    connectAndSubscribe()

    // Cleanup function
    return () => {
      if (locationSubscription) {
        locationSubscription.unsubscribe()
      }
      if (statusSubscription) {
        statusSubscription.unsubscribe()
      }
    }
  }, [orderId, driver, updateDriverLocation])

  // Calculate route when driver location changes or locations are loaded
  useEffect(() => {
    if (driverLocation && (restaurantLocation || deliveryLocation)) {
      calculateRoute()
    }
  }, [driverLocation, restaurantLocation, deliveryLocation, calculateRoute])

  // Fetch order details on component mount
  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  // Get driver status text
  const getDriverStatusText = () => {
    if (!driver) return "Loading..."
    console.log(`status = ${driver.status}`)
    switch (driver.status) {
      case "going_to_restaurant":
        return "Going to restaurant"
      case "at_restaurant":
        return "At restaurant"
      case "going_to_customer":
        return "On the way to you"
      case "arrived":
        return "Arrived"
      default:
        return "On the way"
    }
  }

  // Toggle driver following
  const toggleFollowDriver = () => {
    setIsFollowingDriver((prev) => !prev)
    if (!isFollowingDriver && driverLocation) {
      // If turning following on, immediately center on driver
      if (mapRef.current) {
        mapRef.current.panTo(driverLocation)
      }
    }
    toast.success(isFollowingDriver ? "Map following disabled" : "Map now following driver location")
  }

  // If Google Maps is not loaded yet
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center p-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Driver Tracking</h1>
          {wsConnected ? (
            <span className="ml-auto inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              <span className="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
              Live
            </span>
          ) : (
            <span className="ml-auto inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
              <span className="w-2 h-2 mr-1 bg-red-500 rounded-full"></span>
              Offline
            </span>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={driverLocation || deliveryLocation || { lat: -6.2088, lng: 106.8456 }}
          zoom={16}
          onLoad={onMapLoad}
          options={{
            fullscreenControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            zoomControl: true,
            zoomControlOptions: {
              position: 7, // RIGHT_CENTER
            },
            gestureHandling: "greedy",
          }}
        >
          {/* Restaurant Marker - Store emoji */}
          {restaurantLocation && (
            <Marker
              position={restaurantLocation}
              icon={{
                url:
                  "data:image/svg+xml;charset=UTF-8," +
                  encodeURIComponent(`
                  <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" fill="#10B981" stroke="white" strokeWidth="3"/>
                    <text x="20" y="26" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">🏪</text>
                  </svg>
                `),
                scaledSize: new google.maps.Size(40, 40),
                anchor: new google.maps.Point(20, 20),
              }}
            />
          )}

          {/* Delivery Location Marker - House emoji */}
          {deliveryLocation && (
            <Marker
              position={deliveryLocation}
              icon={{
                url:
                  "data:image/svg+xml;charset=UTF-8," +
                  encodeURIComponent(`
                  <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" fill="#EF4444" stroke="white" strokeWidth="3"/>
                    <text x="20" y="26" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">🏠</text>
                  </svg>
                `),
                scaledSize: new google.maps.Size(40, 40),
                anchor: new google.maps.Point(20, 20),
              }}
            />
          )}

          {/* Driver Marker - Motorcycle emoji */}
          {driverLocation && (
            <Marker
              position={driverLocation}
              icon={{
                url:
                  "data:image/svg+xml;charset=UTF-8," +
                  encodeURIComponent(`
                  <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="25" cy="25" r="22" fill="#3B82F6" stroke="white" strokeWidth="4"/>
                    <text x="25" y="32" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">🏍️</text>
                  </svg>
                `),
                scaledSize: new google.maps.Size(50, 50),
                anchor: new google.maps.Point(25, 25),
              }}
            />
          )}
        </GoogleMap>

        {/* Map Controls */}
        <div className="absolute bottom-4 right-4 z-10">
          <Button
            size="icon"
            className="h-10 w-10 rounded-full bg-white text-black shadow-md hover:bg-gray-100"
            variant={isFollowingDriver ? "default" : "outline"}
            onClick={toggleFollowDriver}
          >
            <Crosshair className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Driver Info & Order Details */}
      <div className="flex-1 p-4 space-y-4">
        {/* Driver Info Card */}
        <Card>
          <CardContent className="p-4">
            {driver ? (
              <div>
                <div className="flex items-center gap-4">
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
                            className={`h-4 w-4 ${
                              star <= Math.round(driver.rating) ? "text-yellow-400" : "text-gray-300"
                            }`}
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
                    <Button size="icon" variant="outline" className="h-10 w-10 rounded-full">
                      <Phone className="h-5 w-5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-10 w-10 rounded-full">
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* ETA and Distance */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <Clock className="h-5 w-5 mx-auto text-orange-500 mb-1" />
                    <p className="text-xs text-gray-600">ETA</p>
                    <p className="font-semibold">{estimatedArrival} min</p>
                  </div>
                  <div className="text-center">
                    <Navigation className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                    <p className="text-xs text-gray-600">Distance</p>
                    <p className="font-semibold">{distance}</p>
                  </div>
                </div>

                {/* Driver Status */}
                <div className="mt-4 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary mr-1" />
                  <span>{getDriverStatusText()}</span>
                </div>
              </div>
            ) : (
              <div className="animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-slate-200 h-16 w-16"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                    <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tip Driver Card */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">💰 Let's tip your driver</h3>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[5000, 10000, 15000, 20000].map((amount) => (
                <Button
                  key={amount}
                  variant={selectedTip === amount ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedTip(amount)
                    setTipAmount(amount)
                  }}
                  className="text-xs"
                >
                  Rp{amount.toLocaleString()}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Custom amount"
                value={tipAmount || ""}
                onChange={(e) => {
                  const value = Number.parseInt(e.target.value) || 0
                  setTipAmount(value)
                  setSelectedTip(null)
                }}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
              />
              <Button size="sm" disabled={!tipAmount}>
                Add Tip
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Order Details Card */}
        {orderDetails && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">📋 Order Details</h3>

              {/* Restaurant Address */}
              <div className="mb-4">
                <div className="flex items-start gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                  <div>
                    <p className="font-medium text-sm">{orderDetails.restaurantName}</p>
                    <p className="text-xs text-muted-foreground">{orderDetails.restaurantLocation.address}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mb-4">
                <div className="flex items-start gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
                  <div>
                    <p className="font-medium text-sm">Delivery Address</p>
                    <p className="text-xs text-muted-foreground">{orderDetails.deliveryLocation.address}</p>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">💳 Payment:</span>
                  <span className="text-sm">{orderDetails.paymentMethod}</span>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium text-sm mb-2">🛍️ Items Ordered</h4>
                <div className="space-y-2">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-1">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-medium">x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-4 pt-3 border-t space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span>Rp{orderDetails.deliveryFee.toLocaleString()}</span>
                  </div>
                  {tipAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Tip</span>
                      <span>Rp{tipAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium text-sm pt-1 border-t">
                    <span>Total</span>
                    <span>Rp{(orderDetails.total + tipAmount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
