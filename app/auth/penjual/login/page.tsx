"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, ArrowLeft, Mail, Lock, ChevronRight } from "lucide-react"
import { Client } from "@stomp/stompjs"
import { login } from "@/services/authService"
import Cookies from "js-cookie";
import Swal from "sweetalert2"


const API_URL = `${process.env.NEXT_PUBLIC_API_URL}auth/authenticate` || "http://localhost:8080/api/v1/";

// WebSocket URL
const WS_URL =
  process.env.NODE_ENV === "development" ? "http://localhost:8080/ws" : "https://api.keeanthebeartian.my.id/ws"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [stompClient, setStompClient] = useState<Client | null>(null)
  const router = useRouter()

  // Function to encode string to base64
  const encodeBase64 = (str: string) => {
    if (typeof window !== "undefined") {
      return window.btoa(str)
    }
    return str
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    setIsLoading(true)

    try {
      const response = await login(email, password, "PENJUAL");
      console.log("Login Response:", response);
      Cookies.set("SNAPEATS_SESSION", response, { expires: 1, secure: true });


      toast.success("You have successfully logged in")
      
      // Redirect to home page
      router.push("/penjual")
    } catch (error:any) {
      Swal.fire({
        title: "Login Gagal!",
        text: error.message || "Terjadi kesalahan saat login",
        icon: "error",
        draggable: false
      });
    } finally {
      setIsLoading(false)
    }
  }

  // Cleanup WebSocket connection on component unmount
  useEffect(() => {
    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.deactivate()
      }
    }
  }, [stompClient])

  // Function to send message (can be used elsewhere in your app)
  const sendMessage = (message: string) => {
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: "/app/hello",
        body: message,
      })
    } else {
      toast.error("WebSocket not connected")
    }
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
              <div className="text-3xl">
                <Image
                  src="/assets/images/penjual/bike-delivery.png"
                  alt="delivery bike"
                  width={200} 
                  height={200}
                  priority 
                />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold">Welcome Back!</h1>
          <p className="text-muted-foreground mt-1">Sign in to continue to ExpressFood</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
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

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-sm text-pink-600 hover:text-pink-700">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember me
            </label>
          </div>

          <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/auth/penjual/register" className="text-pink-600 hover:text-pink-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 bg-gradient-to-r from-pink-50 to-pink-100 rounded-t-3xl mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-pink-800">New User Special</h3>
            <p className="text-sm text-pink-700 mt-1">Get 50% off on your first order!</p>
          </div>
          <Button className="bg-pink-600 hover:bg-pink-700 text-white" size="sm" asChild>
            <Link href="/register">
              Sign Up <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

