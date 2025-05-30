"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { isSessionValid } from "@/lib/session"
import Swal from 'sweetalert2'

export default function ChatPage() {
  const [roomId, setRoomId] = useState("")
  const router = useRouter()

  // Check if user is logged in
  useEffect(() => {
    if (!isSessionValid()) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "You should login first!",
        // footer: '<a href="/login">Login</a>'
      });
      router.push("/login")
    }
  }, [router])

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomId.trim()) {
      toast.error("Please enter a room ID")
      return
    }

    router.push(`/chat/${roomId}`)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <CardTitle>Join a Chat Room</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div className="space-y-2">
              <Input placeholder="Enter Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} />
            </div>
            <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white" disabled={!roomId.trim()}>
              Join Room
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-sm text-muted-foreground">Enter a room ID to join an existing chat or create a new one.</p>
        </CardFooter>
      </Card>
    </div>
  )
}

