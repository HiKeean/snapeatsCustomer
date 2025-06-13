"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Star, Home } from "lucide-react"
import WebSocketService from "@/lib/websocket-service"

export default function OrderCompletedPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [rating, setRating] = useState(5)
  const [review, setReview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deliveryTime, setDeliveryTime] = useState<string>("")
  const [isMounted, setIsMounted] = useState(false)

  // Fix hydration error by only showing time after component mounts
  useEffect(() => {
    setIsMounted(true)
    setDeliveryTime(new Date().toLocaleTimeString())
  }, [])

  const handleSubmitReview = async () => {
    setIsSubmitting(true)

    try {
      const wsService = WebSocketService.getInstance()

      // Send rating and review
      await wsService.send("/app/order/review", {
        orderId,
        rating,
        review,
        timestamp: new Date().toISOString(),
      })

      // Show success message
      setIsSubmitting(false)
      router.push("/pembeli")
    } catch (error) {
      console.error("Failed to submit review:", error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Order Delivered!</h1>
            <p className="text-muted-foreground">Your order has been successfully delivered. Enjoy your meal!</p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-medium">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Time:</span>
                  <span className="font-medium">{isMounted ? deliveryTime : "Loading..."}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-4">Rate your experience</h2>

              <div className="flex justify-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" className="focus:outline-none" onClick={() => setRating(star)}>
                    <Star
                      className={`h-8 w-8 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>

              <Textarea
                placeholder="Share your experience with the driver and food (optional)"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="min-h-[100px]"
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.push("/pembeli")}>
                Skip
              </Button>
              <Button onClick={handleSubmitReview} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="p-4 border-t">
        <Button className="w-full" size="lg" onClick={() => router.push("/pembeli")}>
          <Home className="mr-2 h-5 w-5" />
          Back to Home
        </Button>
      </div>
    </div>
  )
}
