"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline, DirectionsRenderer } from "@react-google-maps/api"

interface DeliveryMapProps {
  driverLocation: {
    lat: number
    lng: number
  }
  restaurantLocation: {
    lat: number
    lng: number
  }
  deliveryLocation: {
    lat: number
    lng: number
  }
  vehicleType: "motorcycle" | "bicycle"
  onDistanceCalculated?: (distanceInfo: {
    driverToRestaurant: { distance: string; duration: string }
    restaurantToDelivery: { distance: string; duration: string }
    totalDistance: string
    totalDuration: string
  }) => void
}

// Define the libraries to load
const libraries: ["places"] = ["places"]

// Map container style
const containerStyle = {
  width: "100%",
  height: "100%",
}

export function DeliveryMap({
  driverLocation,
  restaurantLocation,
  deliveryLocation,
  vehicleType,
  onDistanceCalculated,
}: DeliveryMapProps) {
  // Load the Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBT04DBevaxBwh5OgG4yJ9roE909mnkT7E",
    libraries,
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)
  const [selectedMarker, setSelectedMarker] = useState<"driver" | "restaurant" | "delivery" | null>(null)
  const [distanceInfo, setDistanceInfo] = useState<{
    driverToRestaurant: { distance: string; duration: string }
    restaurantToDelivery: { distance: string; duration: string }
    totalDistance: string
    totalDuration: string
  } | null>(null)

  // Ref to track if we've calculated distances
  const hasCalculatedDistances = useRef(false)

  // Calculate center of the map based on all locations
  const center = {
    lat: (driverLocation.lat + restaurantLocation.lat + deliveryLocation.lat) / 3,
    lng: (driverLocation.lng + restaurantLocation.lng + deliveryLocation.lng) / 3,
  }

  // Map load callback
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  // Map unmount callback
  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  // Handle map click for single-click panning
  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (map && e.latLng) {
        map.panTo(e.latLng)
      }
    },
    [map],
  )

  // Get directions and calculate distances when locations change
  useEffect(() => {
    if (isLoaded && !loadError && typeof google !== "undefined") {
      const directionsService = new google.maps.DirectionsService()

      // First get directions from driver to restaurant
      directionsService.route(
        {
          origin: driverLocation,
          destination: restaurantLocation,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            // Then get directions from restaurant to delivery location
            directionsService.route(
              {
                origin: restaurantLocation,
                destination: deliveryLocation,
                travelMode: google.maps.TravelMode.DRIVING,
              },
              (result2, status2) => {
                if (status2 === google.maps.DirectionsStatus.OK && result2) {
                  // Combine the routes
                  const combinedResult = {
                    ...result,
                    routes: [
                      {
                        ...result.routes[0],
                        legs: [...result.routes[0].legs, ...result2.routes[0].legs],
                      },
                    ],
                  }
                  setDirections(combinedResult)
                }
              },
            )
          }
        },
      )
    }
  }, [isLoaded, loadError, driverLocation, restaurantLocation, deliveryLocation])

  // Calculate distances separately to avoid recalculating on every driver location change
  useEffect(() => {
    // Only calculate distances if we haven't already or if restaurant/delivery locations change
    if (isLoaded && !loadError && typeof google !== "undefined" && !hasCalculatedDistances.current) {
      const distanceMatrixService = new google.maps.DistanceMatrixService()

      // Calculate distance from driver to restaurant
      distanceMatrixService.getDistanceMatrix(
        {
          origins: [driverLocation],
          destinations: [restaurantLocation],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
        },
        (driverToRestaurantResult) => {
          if (
            driverToRestaurantResult &&
            driverToRestaurantResult.rows[0] &&
            driverToRestaurantResult.rows[0].elements[0].status === "OK"
          ) {
            const driverToRestaurantDistance = driverToRestaurantResult.rows[0].elements[0].distance.text
            const driverToRestaurantDuration = driverToRestaurantResult.rows[0].elements[0].duration.text

            // Calculate distance from restaurant to delivery
            distanceMatrixService.getDistanceMatrix(
              {
                origins: [restaurantLocation],
                destinations: [deliveryLocation],
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.METRIC,
              },
              (restaurantToDeliveryResult) => {
                if (
                  restaurantToDeliveryResult &&
                  restaurantToDeliveryResult.rows[0] &&
                  restaurantToDeliveryResult.rows[0].elements[0].status === "OK"
                ) {
                  const restaurantToDeliveryDistance = restaurantToDeliveryResult.rows[0].elements[0].distance.text
                  const restaurantToDeliveryDuration = restaurantToDeliveryResult.rows[0].elements[0].duration.text

                  // Calculate total distance and duration
                  const driverToRestaurantDistanceValue = driverToRestaurantResult.rows[0].elements[0].distance.value
                  const restaurantToDeliveryDistanceValue =
                    restaurantToDeliveryResult.rows[0].elements[0].distance.value
                  const totalDistanceValue = driverToRestaurantDistanceValue + restaurantToDeliveryDistanceValue

                  const driverToRestaurantDurationValue = driverToRestaurantResult.rows[0].elements[0].duration.value
                  const restaurantToDeliveryDurationValue =
                    restaurantToDeliveryResult.rows[0].elements[0].duration.value
                  const totalDurationValue = driverToRestaurantDurationValue + restaurantToDeliveryDurationValue

                  // Format total distance
                  let totalDistance = ""
                  if (totalDistanceValue < 1000) {
                    totalDistance = `${totalDistanceValue} m`
                  } else {
                    totalDistance = `${(totalDistanceValue / 1000).toFixed(1)} km`
                  }

                  // Format total duration
                  let totalDuration = ""
                  if (totalDurationValue < 60) {
                    totalDuration = `${totalDurationValue} sec`
                  } else if (totalDurationValue < 3600) {
                    totalDuration = `${Math.floor(totalDurationValue / 60)} min`
                  } else {
                    const hours = Math.floor(totalDurationValue / 3600)
                    const minutes = Math.floor((totalDurationValue % 3600) / 60)
                    totalDuration = `${hours} hr ${minutes} min`
                  }

                  // Set distance info
                  const info = {
                    driverToRestaurant: {
                      distance: driverToRestaurantDistance,
                      duration: driverToRestaurantDuration,
                    },
                    restaurantToDelivery: {
                      distance: restaurantToDeliveryDistance,
                      duration: restaurantToDeliveryDuration,
                    },
                    totalDistance,
                    totalDuration,
                  }
                  setDistanceInfo(info)
                  hasCalculatedDistances.current = true

                  // Call the callback if provided
                  if (onDistanceCalculated) {
                    onDistanceCalculated(info)
                  }
                }
              },
            )
          }
        },
      )
    }
  }, [isLoaded, loadError, restaurantLocation, deliveryLocation, onDistanceCalculated])

  // Fit bounds to show all markers when map and directions are ready
  useEffect(() => {
    if (map && directions) {
      const bounds = new google.maps.LatLngBounds()
      bounds.extend(new google.maps.LatLng(driverLocation.lat, driverLocation.lng))
      bounds.extend(new google.maps.LatLng(restaurantLocation.lat, restaurantLocation.lng))
      bounds.extend(new google.maps.LatLng(deliveryLocation.lat, deliveryLocation.lng))
      map.fitBounds(bounds)
    }
  }, [map, directions, driverLocation, restaurantLocation, deliveryLocation])

  // Show loading state if maps API is not loaded yet
  if (loadError) {
    return <div className="h-full w-full flex items-center justify-center">Error loading maps</div>
  }

  if (!isLoaded) {
    return <div className="h-full w-full flex items-center justify-center">Loading maps...</div>
  }

  return (
    <div className="relative h-full w-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP,
          },
          gestureHandling: "greedy", // Allow one-finger panning
          draggableCursor: "pointer", // Change cursor to indicate clickable
        }}
      >
        {/* Driver Marker - Explicitly positioned by lat/lng for easy API integration */}
        <Marker
          position={{
            lat: driverLocation.lat,
            lng: driverLocation.lng,
          }}
          icon={{
            url:
              vehicleType === "bicycle"
                ? "data:image/svg+xml;charset=UTF-8," +
                  encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="18" fill="#22c55e" />
                  <path d="M10 25a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm20 0a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM8.33 20h23.34M15 15l6.67 5h8.33M10 5v10" stroke="white" strokeWidth="2" fill="none" />
                </svg>
              `)
                : "data:image/svg+xml;charset=UTF-8," +
                  encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="18" fill="#22c55e" />
                  <path d="M8.33 26.67a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm23.34 0a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12.5 23.33h15M23.33 11.67h1.67a3.33 3.33 0 0 1 3.33 3.33v8.33M10 15h11.67" stroke="white" strokeWidth="2" fill="none" />
                </svg>
              `),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20),
          }}
          onClick={() => setSelectedMarker("driver")}
          zIndex={3}
        />

        {/* Restaurant Marker */}
        <Marker
          position={restaurantLocation}
          icon={{
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="#ef4444" />
                <path d="M10 23.12A6.67 6.67 0 0 1 12.35 10a8.52 8.52 0 0 1 1.75-2.57 8.33 8.33 0 0 1 11.8 0A8.52 8.52 0 0 1 27.65 10a6.67 6.67 0 0 1 2.35 13.12V35H10Z M10 28.33h20" stroke="white" strokeWidth="2" fill="none" />
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20),
          }}
          onClick={() => setSelectedMarker("restaurant")}
          zIndex={2}
        />

        {/* Delivery Location Marker */}
        <Marker
          position={deliveryLocation}
          icon={{
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="#3b82f6" />
                <path d="M33.33 16.67c0 10-13.33 20-13.33 20s-13.33-10-13.33-20a13.33 13.33 0 0 1 26.66 0Z M20 16.67a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" stroke="white" strokeWidth="2" fill="none" />
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20),
          }}
          onClick={() => setSelectedMarker("delivery")}
          zIndex={1}
        />

        {/* Info Windows with Distance Information */}
        {selectedMarker === "driver" && (
          <InfoWindow position={driverLocation} onCloseClick={() => setSelectedMarker(null)}>
            <div className="p-1">
              <p className="font-medium">Driver</p>
              <p className="text-sm text-gray-600">On the way</p>
              {distanceInfo && (
                <p className="text-xs text-blue-600 mt-1">
                  {distanceInfo.driverToRestaurant.distance} ({distanceInfo.driverToRestaurant.duration}) to restaurant
                </p>
              )}
            </div>
          </InfoWindow>
        )}

        {selectedMarker === "restaurant" && (
          <InfoWindow position={restaurantLocation} onCloseClick={() => setSelectedMarker(null)}>
            <div className="p-1">
              <p className="font-medium">Restaurant</p>
              <p className="text-sm text-gray-600">Order pickup location</p>
              {distanceInfo && (
                <p className="text-xs text-blue-600 mt-1">
                  {distanceInfo.restaurantToDelivery.distance} ({distanceInfo.restaurantToDelivery.duration}) to
                  delivery
                </p>
              )}
            </div>
          </InfoWindow>
        )}

        {selectedMarker === "delivery" && (
          <InfoWindow position={deliveryLocation} onCloseClick={() => setSelectedMarker(null)}>
            <div className="p-1">
              <p className="font-medium">Delivery Location</p>
              <p className="text-sm text-gray-600">Your address</p>
              {distanceInfo && (
                <p className="text-xs text-blue-600 mt-1">
                  Total journey: {distanceInfo.totalDistance} ({distanceInfo.totalDuration})
                </p>
              )}
            </div>
          </InfoWindow>
        )}

        {/* Route Lines */}
        {!directions && (
          <>
            <Polyline
              path={[driverLocation, restaurantLocation]}
              options={{
                strokeColor: "#3b82f6",
                strokeOpacity: 0.7,
                strokeWeight: 4,
                icons: [
                  {
                    icon: {
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: 3,
                      fillOpacity: 1,
                      strokeOpacity: 1,
                    },
                    offset: "0",
                    repeat: "10px",
                  },
                ],
              }}
            />
            <Polyline
              path={[restaurantLocation, deliveryLocation]}
              options={{
                strokeColor: "#3b82f6",
                strokeOpacity: 0.7,
                strokeWeight: 4,
                icons: [
                  {
                    icon: {
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: 3,
                      fillOpacity: 1,
                      strokeOpacity: 1,
                    },
                    offset: "0",
                    repeat: "10px",
                  },
                ],
              }}
            />
          </>
        )}

        {/* Directions Renderer */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: "#3b82f6",
                strokeOpacity: 0.7,
                strokeWeight: 4,
              },
            }}
          />
        )}
      </GoogleMap>

      {/* Distance Information Overlay */}
      {distanceInfo && (
        <div className="absolute bottom-2 left-2 right-2 bg-white bg-opacity-90 rounded-lg p-2 shadow-md text-xs">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium">Driver → Restaurant:</span>{" "}
              <span className="text-gray-700">
                {distanceInfo.driverToRestaurant.distance} ({distanceInfo.driverToRestaurant.duration})
              </span>
            </div>
            <div>
              <span className="font-medium">Restaurant → You:</span>{" "}
              <span className="text-gray-700">
                {distanceInfo.restaurantToDelivery.distance} ({distanceInfo.restaurantToDelivery.duration})
              </span>
            </div>
          </div>
          <div className="mt-1 text-center text-primary font-medium">
            Total journey: {distanceInfo.totalDistance} ({distanceInfo.totalDuration})
          </div>
        </div>
      )}

      {/* Instructions Overlay */}
      <div className="absolute top-2 left-2 right-2 bg-white bg-opacity-90 rounded-lg p-2 shadow-md text-xs text-center">
        Click anywhere on the map to move the view
      </div>
    </div>
  )
}
