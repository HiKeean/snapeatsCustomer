"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, CheckCircle2, Loader2, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatRupiah } from "@/services/api"
import WebSocketService from "@/lib/websocket-service"
import Swal from "sweetalert2"

interface PaymentDetails {
  id: string
  orderId: string
  restaurantName: string
  total: number
  date: string
  status: "pending" | "completed" | "failed" | "expired"
}

export default function QRISPaymentPage() {
  const router = useRouter()
  const params = useParams()
  const paymentId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutes in seconds
  const [wsConnected, setWsConnected] = useState(false)
  const [wsError, setWsError] = useState<string | null>(null)

  // Generate QR code URL
  const getQRCodeUrl = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://192.168.18.30:3002"
    const successUrl = `${baseUrl}/pembeli/payment/qris/success/${paymentId}`
    return `https://quickchart.io/qr?text=${encodeURIComponent(successUrl)}&size=250&dark=000000&light=ffffff&margin=2`
  }, [paymentId])

  // Function to fetch initial payment details
  const fetchPaymentDetails = useCallback(async () => {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const savedCart = localStorage.getItem("restaurantCart")
      const totalPrice = localStorage.getItem("totalPrice")
      if(savedCart == null && totalPrice == null){
        Swal.fire("Error", "Error Internal Server", "error")
        // router.back();
      }
      // localStorage.removeItem("totalPrice");

      if (savedCart) {
        const cartData = JSON.parse(savedCart)
        setPaymentDetails({
          id: paymentId,
          orderId: "ORD" + Math.floor(Math.random() * 1000000),
          restaurantName: cartData.restaurantName,
          total: Number.parseInt(totalPrice!),
          date: new Date().toISOString(),
          status: "pending",
        })
      } else {
        // Handle case where cart data is not available
        console.error("Cart data not found")
        setPaymentDetails({
          id: paymentId,
          orderId: "ORD" + Math.floor(Math.random() * 1000000),
          restaurantName: "Unknown Restaurant",
          total: 150000, // Default amount
          date: new Date().toISOString(),
          status: "pending",
        })
      }

      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching payment details:", error)
      setIsLoading(false)
    }
  }, [paymentId])

  // Connect to WebSocket and subscribe to payment updates
  useEffect(() => {
    if (!paymentId) return

    const wsService = WebSocketService.getInstance()
    let subscription: { unsubscribe: () => void } | null = null

    const connectAndSubscribe = async () => {
      try {
        // Connect to WebSocket
        await wsService.connect()
        setWsConnected(true)
        setWsError(null)

        // Subscribe to payment status updates
        subscription = await wsService.subscribe(`/topic/payment/${paymentId}`, (message) => {
          console.log("Received payment update:", message)

          if (message.status) {
            setPaymentDetails((current) => (current ? { ...current, status: message.status } : null))
          }
        })

        // Send a message to request the current payment status
        await wsService.send("/app/payment/status", { paymentId })
      } catch (error) {
        console.error("WebSocket connection error:", error)
        setWsConnected(false)
        setWsError("Failed to connect to payment updates. Retrying...")

        // Retry connection after 5 seconds
        setTimeout(connectAndSubscribe, 5000)
      }
    }

    // First fetch the payment details from API
    fetchPaymentDetails().then(() => {
      // Then connect to WebSocket for real-time updates
      connectAndSubscribe()
    })

    // Cleanup function
    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [paymentId, fetchPaymentDetails])

  // Countdown timer effect
  useEffect(() => {
    if (!paymentDetails || paymentDetails.status !== "pending") return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Handle payment expiration
          setPaymentDetails((current) => (current ? { ...current, status: "expired" } : null))
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [paymentDetails])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const calculateTotal = (cartData: any) => {
    // Calculate subtotal
    const subtotal = cartData.items.reduce((total: number, item: any) => {
      return total + (item.totalPrice || item.price * item.quantity)
    }, 0)

    // Add delivery fee and tax
    const deliveryFee = 10000
    const tax = Math.round(subtotal * 0.1)

    return subtotal + deliveryFee + tax
  }

  const handlePaymentCompleted = () => {
    // Clear cart and redirect to success page
    localStorage.removeItem("restaurantCart")
    localStorage.removeItem("totalPrice")
    // localStorage.setItem("idTransaksi", paymentId);
    router.push(`/pembeli/checkout/${paymentId}`)
  }

  // For demo purposes - simulate payment completion
  const simulatePaymentCompletion = async () => {
    try {
      const wsService = WebSocketService.getInstance()

      // Send a message to simulate payment completion
      await wsService.send("/app/payment/complete", {
        paymentId,
        status: "completed",
        timestamp: new Date().toISOString(),
      })

      // Update local state immediately for better UX
      setPaymentDetails((current) => (current ? { ...current, status: "completed" } : null))
    } catch (error) {
      console.error("Failed to simulate payment completion:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!paymentDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-500">Payment Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">We couldn't find the payment details for this transaction.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/")}>
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (paymentDetails.status === "completed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-2" />
            <CardTitle className="text-xl">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Your payment has been successfully processed. You will be redirected to the confirmation page.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handlePaymentCompleted}>
              Continue
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (paymentDetails.status === "expired") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-500">Payment Expired</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">The payment session has expired. Please try again.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/")}>
              Return to Cart
            </Button>
          </CardFooter>
        </Card>
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
          <h1 className="text-xl font-bold">QRIS Payment</h1>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Scan QR Code to Pay</CardTitle>
            <div className="flex items-center justify-center gap-2">
              <p className="text-muted-foreground">
                Time remaining: <span className="font-medium">{formatTime(timeLeft)}</span>
              </p>
              {wsConnected ? (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  <span className="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
                  Live
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline
                </span>
              )}
            </div>
            {wsError && <p className="text-xs text-red-500 mt-1">{wsError}</p>}
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {/* QR Code Image */}
            <div className="relative w-64 h-64 mb-4 border-4 border-primary/10 rounded-lg p-2 bg-white">
              <Image
                src={getQRCodeUrl() || "/placeholder.svg"}
                alt="QRIS Payment QR Code"
                width={250}
                height={250}
                className="object-contain"
                priority
              />
            </div>

            {/* Order Details */}
            <div className="w-full space-y-2 border-t pt-4 mt-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment ID:</span>
                <span className="font-medium">{paymentDetails.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-medium">{paymentDetails.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Restaurant:</span>
                <span className="font-medium">{paymentDetails.restaurantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-bold">{formatRupiah(paymentDetails.total)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col space-y-2">
            <p className="text-sm text-center text-muted-foreground mb-2">
              Please open your mobile banking or e-wallet app and scan this QR code to complete your payment
            </p>
            <Button variant="outline" className="w-full" onClick={simulatePaymentCompletion}>
              I've completed the payment
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
