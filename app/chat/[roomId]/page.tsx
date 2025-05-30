"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import WebSocketService from "@/lib/websocket-service"
import { isSessionValid } from "@/lib/session"
import Swal from "sweetalert2"

interface Message {
  content: string
  sender: string
  timestamp: Date
}

export default function ChatRoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string

  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState("")
  const [username, setUsername] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [subscription, setSubscription] = useState<{ unsubscribe: () => void } | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

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

    // Get username from localStorage or generate a temporary one
    // In a real app, you might want to decode the JWT to get the username
    const storedUsername = localStorage.getItem("username")
    if (storedUsername) {
      setUsername(storedUsername)
    } else {
      const tempUsername = `User_${Math.floor(Math.random() * 10000)}`
      setUsername(tempUsername)
      localStorage.setItem("username", tempUsername)
    }
  }, [router])

  // Connect to WebSocket and subscribe to room
  useEffect(() => {
    if (!username) return

    const connectToRoom = async () => {
      setIsConnecting(true)

      try {
        const wsService = WebSocketService.getInstance()
        await wsService.connect()

        // Subscribe to the room-specific topic
        const sub = await wsService.subscribe(`/topic/chat/${roomId}`, (receivedMsg) => {
          const msgObj =
            typeof receivedMsg === "string"
              ? { content: receivedMsg, sender: "Unknown", timestamp: new Date() }
              : {
                  content: receivedMsg.content,
                  sender: receivedMsg.sender,
                  timestamp: new Date(receivedMsg.timestamp || Date.now()),
                }

          setMessages((prev) => [...prev, msgObj])

          // Scroll to bottom on new message
          setTimeout(() => {
            if (scrollAreaRef.current) {
              scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
            }
          }, 100)
        })

        setSubscription(sub)
        setIsConnected(true)

        // Send a join message
        await wsService.send(`/app/chat/${roomId}`, {
          content: `${username} has joined room ${roomId}`,
          sender: "System",
          timestamp: new Date().toISOString(),
        })

        toast.success(`Connected to room ${roomId}`)
      } catch (error) {
        console.error("Failed to connect to chat room:", error)

        // Check if the error is related to authentication
        if (error instanceof Error && error.message.includes("access token")) {
          toast.error("Authentication failed. Please log in again.")
          router.push("/login")
        } else {
          toast.error("Failed to connect to chat room. Please try again.")
        }
      } finally {
        setIsConnecting(false)
      }
    }

    connectToRoom()

    // Cleanup on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [roomId, username, router])

  const sendMessage = async () => {
    if (!message.trim() || !isConnected) return

    try {
      const wsService = WebSocketService.getInstance()

      // Create message object
      const chatMessage = {
        content: message.trim(),
        sender: username,
        timestamp: new Date().toISOString(),
      }

      // Send message to the room-specific destination
      await wsService.send(`/app/chat/${roomId}`, chatMessage)
      setMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("Failed to send message. Please try again.")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-pink-600 mb-4" />
            <p>Connecting to chat room...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b flex flex-row items-center">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <CardTitle>Room: {roomId}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.sender === username ? "items-end" : msg.sender === "System" ? "items-center" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-lg ${
                      msg.sender === username
                        ? "bg-pink-600 text-white"
                        : msg.sender === "System"
                          ? "bg-gray-200 text-gray-700 text-sm"
                          : "bg-muted"
                    }`}
                  >
                    {msg.sender !== "System" && (
                      <div className="font-medium text-sm">{msg.sender === username ? "You" : msg.sender}</div>
                    )}
                    <div>{msg.content}</div>
                    <div className="text-xs opacity-70 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t p-2">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim() || !isConnected}
              className="bg-pink-600 hover:bg-pink-700 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}

