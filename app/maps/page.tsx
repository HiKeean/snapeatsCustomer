"use client"
import { MapContainer } from "@/components/map-container"
import { OrderStatus } from "@/components/order-status"
import { useJsApiLoader } from "@react-google-maps/api"

// Define libraries as a constant array of strings
const libraries: ["places"] = ["places"]

export default function Maps() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBT04DBevaxBwh5OgG4yJ9roE909mnkT7E",
    libraries: libraries,
  })

  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="relative w-full max-w-md h-[100vh]">
        <MapContainer isLoaded={isLoaded} />
        <OrderStatus />
      </div>
    </main>
  )
}

