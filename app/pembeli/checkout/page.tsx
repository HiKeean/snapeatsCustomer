"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, Clock, MapPin, ChefHat, Bike, Phone, MessageSquare, Loader2 } from "lucide-react"
import { useStompWebSocket } from "@/hooks/use-stomp-websocket"
import { BottomNavigation } from "@/components/bottom-navigation"
import Swal from "sweetalert2"
import WebSocketService from "@/lib/websocket-service" // Declare WebSocketService
import { getImageUrl } from "@/services/api"

// Order status types
type OrderStatus = "preparing" | "ready" | "driver_assigned" | "on_the_way" | "arrived"

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

export default function CheckoutPage() {
  const router = useRouter()
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null)
  const [estimatedTime, setEstimatedTime] = useState(25)
  const [driver, setDriver] = useState<Driver | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [wsConnected, setWsConnected] = useState(false)
  const [wsError, setWsError] = useState<string | null>(null)

  // Get WebSocket connection
  const { status: wsStatus, subscribe, send } = useStompWebSocket()

  useEffect(() => {
    // Get transaction ID from localStorage
    const storedTransactionId = localStorage.getItem("idTransaksi")
    if (!storedTransactionId) {
      Swal.fire({
        title: "Error",
        text: "No transaction ID found",
        icon: "error",
        confirmButtonText: "Go to Home",
      }).then(() => {
        router.push("/pembeli")
      })
      return
    }

    setTransactionId(storedTransactionId)

    // Connect to WebSocket and subscribe to order status updates
    const wsService = WebSocketService.getInstance()
    let subscription: { unsubscribe: () => void } | null = null

    const connectAndSubscribe = async () => {
      try {
        // Connect to WebSocket
        await wsService.connect()
        setWsConnected(true)
        setWsError(null)

        // Subscribe to order status updates
        subscription = await wsService.subscribe(`/topic/order/${storedTransactionId}/status`, (message:any) => {
          console.log("Received order status update:", message)
          setIsLoading(false)

          if (message.status) {
            setOrderStatus(message.status)
          }

          if (message.estimatedTime) {
            setEstimatedTime(message.estimatedTime)
          }

          // If driver is assigned, update driver info
          if (message.status === "driver_assigned" && message.driver) {
            setDriver(message.driver)
          }

          // If driver is on the way, redirect to tracking page
          if (message.status === "on_the_way") {
            router.push(`/pembeli/tracking/${storedTransactionId}`)
          }
        })

        // Send a message to request the current order status
        await wsService.send("/app/order/status", { orderId: storedTransactionId })
      } catch (error) {
        console.error("WebSocket connection error:", error)
        setWsConnected(false)
        setWsError("Failed to connect to order updates. Retrying...")
        setIsLoading(false)

        // Retry connection after 5 seconds
        setTimeout(connectAndSubscribe, 5000)
      }
    }

    // Connect to WebSocket
    connectAndSubscribe()

    // Cleanup function
    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [router])

  // Render different content based on order status
  const renderStatusContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">Connecting to order status...</p>
        </div>
      )
    }

    if (!wsConnected) {
      return (
        <div className="text-center py-12">
          <div className="bg-red-50 p-4 rounded-lg mb-6">
            <p className="text-red-600 font-medium">Connection Error</p>
            <p className="text-sm text-red-500 mt-1">{wsError || "Failed to connect to server"}</p>
          </div>
          <Button onClick={() => window.location.reload()}>Retry Connection</Button>
        </div>
      )
    }

    if (!orderStatus) {
      return (
        <div className="text-center py-12">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-slate-200 h-24 w-24 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      )
    }

    switch (orderStatus) {
      case "preparing":
        return (
          <div className="text-center">
            <div className="relative w-64 h-64 mx-auto mb-6">
              <Image
                src={getImageUrl("/bambang/memasak.png")}
                alt="Chef preparing food"
                fill
                className="object-contain"
              />
            </div>
            <h2 className="text-2xl font-bold mb-2">Preparing Your Order</h2>
            <p className="text-muted-foreground mb-6">The restaurant is preparing your delicious meal</p>
            <div className="flex items-center justify-center gap-2 text-lg font-medium">
              <Clock className="h-5 w-5 text-primary" />
              <span>Estimated time: {estimatedTime} minutes</span>
            </div>
          </div>
        )

      case "ready":
        return (
          <div className="text-center">
            <div className="relative w-64 h-64 mx-auto mb-6">
              <Image  
                src={getImageUrl("/bambang/mencarikurir.png")}
                alt="Food ready" fill className="object-contain" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Order Ready!</h2>
            <p className="text-muted-foreground mb-6">Your order is ready and we're looking for a driver</p>
            <div className="flex items-center justify-center gap-2 text-lg font-medium">
              <Bike className="h-5 w-5 text-primary" />
              <span>Finding a driver...</span>
            </div>
          </div>
        )

      case "driver_assigned":
        return (
          <div className="text-center">
            <div className="relative w-64 h-64 mx-auto mb-6">
              <Image
                src={getImageUrl("/bambang/deliveryfood.png")}
                alt="Driver assigned"
                fill
                className="object-contain"
              />
            </div>
            <h2 className="text-2xl font-bold mb-2">Driver Assigned!</h2>
            <p className="text-muted-foreground mb-6">Your driver is on the way to pick up your order</p>

            {driver && (
              <Card className="mb-4">
                <CardContent className="p-4">
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
                    <div className="flex flex-col gap-2">
                      <Button size="icon" variant="outline" className="h-10 w-10 rounded-full">
                        <Phone className="h-5 w-5" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-10 w-10 rounded-full">
                        <MessageSquare className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-center gap-2 text-lg font-medium">
              <Clock className="h-5 w-5 text-primary" />
              <span>Estimated arrival: {estimatedTime} minutes</span>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading order status...</p>
          </div>
        )
    }
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center p-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/pembeli")} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Order Status</h1>
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

      {/* Order Status Content */}
      <div className="p-4">
        {/* Order Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col items-center">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  orderStatus ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1">Confirmed</span>
            </div>

            <div className="flex-1 h-1 mx-2 bg-muted">
              <div className={`h-full bg-primary ${orderStatus ? "w-full" : "w-0"}`}></div>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  orderStatus === "preparing" ||
                  orderStatus === "ready" ||
                  orderStatus === "driver_assigned" ||
                  orderStatus === "on_the_way" ||
                  orderStatus === "arrived"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <ChefHat className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1">Preparing</span>
            </div>

            <div className="flex-1 h-1 mx-2 bg-muted">
              <div
                className={`h-full bg-primary ${
                  orderStatus === "ready" ||
                  orderStatus === "driver_assigned" ||
                  orderStatus === "on_the_way" ||
                  orderStatus === "arrived"
                    ? "w-full"
                    : "w-0"
                }`}
              ></div>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  orderStatus === "ready" ||
                  orderStatus === "driver_assigned" ||
                  orderStatus === "on_the_way" ||
                  orderStatus === "arrived"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Bike className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1">On the way</span>
            </div>

            <div className="flex-1 h-1 mx-2 bg-muted">
              <div className={`h-full bg-primary ${orderStatus === "arrived" ? "w-full" : "w-0"}`}></div>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  orderStatus === "arrived" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <MapPin className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1">Delivered</span>
            </div>
          </div>
        </div>

        {/* Status Content */}
        {renderStatusContent()}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
