"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { CheckCircle, Loader2 } from "lucide-react"
import { verifyPayment } from "@/services/transactionService"

export default function QRISPaymentSuccessPage() {
  const params = useParams()
  const paymentId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyPaymentStatus = async () => {
      try {
        // Call the bambang service to verify payment
        const result = await verifyPayment(paymentId)

        // If verification is successful, show success UI
        if (result === true) {
          setIsVerified(true)
        } else {
          setError("Payment verification failed. Please contact customer support.")
        }
      } catch (error) {
        console.error("Error verifying payment:", error)
        setError("An error occurred while verifying your payment. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    verifyPaymentStatus()
  }, [paymentId])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-green-600 mb-4" />
        <p className="text-gray-600">Verifying your payment...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-red-700 mb-2">Verification Failed</h1>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    )
  }

  if (isVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-500">
        <div className="bg-white rounded-full p-4 mb-6 shadow-lg">
          <CheckCircle className="h-24 w-24 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Payment Successful</h1>
        <p className="text-white text-opacity-90">Thank you for your payment</p>
      </div>
    )
  }

  // Fallback UI (should not normally be reached)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <p className="text-gray-600">Processing payment verification...</p>
    </div>
  )
}
