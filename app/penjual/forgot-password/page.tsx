"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
      toast.success("Check your inbox for password reset instructions")
    }, 1500)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="relative h-20 w-20 mx-auto mb-4">
            <div className="absolute inset-0 bg-pink-100 rounded-full flex items-center justify-center">
              <div className="text-3xl">🔑</div>
            </div>
          </div>
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="text-muted-foreground mt-1">
            {isSubmitted ? "Check your email for reset instructions" : "Enter your email to reset your password"}
          </p>
        </div>

        {isSubmitted ? (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <p className="text-muted-foreground">
              We've sent a password reset link to <span className="font-medium">{email}</span>. Please check your inbox
              and follow the instructions.
            </p>

            <div className="pt-4 space-y-3">
              <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white" onClick={() => setIsSubmitted(false)}>
                Resend Email
              </Button>

              <Button variant="outline" className="w-full" asChild>
                <Link href="/login">Back to Login</Link>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white" disabled={isLoading}>
              {isLoading ? "Sending..." : "Reset Password"}
            </Button>

            <div className="text-center mt-4">
              <Link href="/login" className="text-sm text-pink-600 hover:text-pink-700">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 bg-gradient-to-r from-pink-50 to-pink-100 rounded-t-3xl mt-8">
        <div className="text-center">
          <h3 className="font-medium text-pink-800">Need Help?</h3>
          <p className="text-sm text-pink-700 mt-1">
            Contact our support team at{" "}
            <a href="mailto:support@foodexpress.com" className="underline">
              support@foodexpress.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

