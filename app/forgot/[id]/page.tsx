"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Lock } from "lucide-react"
import { changePassword, validateLinkForgot } from "@/services/authService"
import Swal from "sweetalert2"

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const params = useParams()
  const router = useRouter()
  const linkId = params.id as string
  const [token, setToken] = useState("")

  useEffect(() => {
    const getToken = async()=>{
        try {
            const response = await validateLinkForgot(linkId);
            if(!response){
                Swal.fire({
                    title: "Internal Server Error!",
                    icon: "error",
                  });
                router.push('/login');
            }
        } catch (error:any) {
            Swal.fire({
                title: "Link Invalid!",
                text: error.message || "Link Expired",
                icon: "error",
                draggable: false
              });
            router.push('/login');
        }
    }
    getToken();
  }, [linkId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPassword || !confirmPassword) {
      Swal.fire({
            title: "Failed",
            text: "Please fill in all fields",
            icon: "error",
          });
      return
    }

    if (newPassword !== confirmPassword) {
        Swal.fire({
            title: "Failed",
            text: "Passwords do not match",
            icon: "error",
          });
      return
    }

    setIsLoading(true)

    // Simulate API call
    try {
        const resp = changePassword(newPassword, "cw", linkId);
        Swal.fire({
            title: "Change Password Success",
            text: "Silahkan Login kembali",
            icon: "success",
          });
        setTimeout(() => {
            router.push("/login") 
        }, 1000)
        // setIsLoading(false);
    } catch (error:any) {
        Swal.fire({
            title: "Change Password Failed!",
            text: error.message || "Link Expired",
            icon: "error",
            draggable: false
          });
        router.push('/login');
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
          <h1 className="text-2xl font-bold">Change Password</h1>
          <p className="text-muted-foreground mt-1">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white" disabled={isLoading}>
            {isLoading ? "Changing..." : "Change Password"}
          </Button>
        </form>
      </div>

      {/* Footer */}
      <div className="p-6 bg-gradient-to-r from-pink-50 to-pink-100 rounded-t-3xl mt-8">
        <div className="text-center">
          <h3 className="font-medium text-pink-800">Need Help?</h3>
          <p className="text-sm text-pink-700 mt-1">
            Contact our support team at{" "}
            <a href="mailto:snapeats.id@gmail.com" className="underline">
              snapeats.id@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}