"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import WebSocketService from "@/lib/websocket-service"

type ConnectionStatus = "connecting" | "connected" | "disconnected"

export function useStompWebSocket() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected")
  const [lastMessage, setLastMessage] = useState<any>(null)
  const subscriptionsRef = useRef<{ [key: string]: { unsubscribe: () => void } }>({})
  const wsServiceRef = useRef<WebSocketService | null>(null)

  // Initialize WebSocketService
  useEffect(() => {
    wsServiceRef.current = WebSocketService.getInstance()

    const connectToWebSocket = async () => {
      try {
        setStatus("connecting")
        await wsServiceRef.current?.connect()
        setStatus("connected")
      } catch (error) {
        console.error("Failed to connect to WebSocket:", error)
        setStatus("disconnected")
      }
    }

    connectToWebSocket()

    // Cleanup function
    return () => {
      // Unsubscribe from all subscriptions
      Object.values(subscriptionsRef.current).forEach((subscription) => {
        subscription.unsubscribe()
      })

      // Note: We don't disconnect the WebSocketService here since it's a singleton
      // and might be used by other components
    }
  }, [])

  // Subscribe to a destination
  const subscribe = useCallback((destination: string, callback: (message: any) => void) => {
    if (!wsServiceRef.current) {
      console.error("WebSocketService not initialized")
      return () => {}
    }

    // Create a unique subscription ID for this destination + callback combination
    const subscriptionId = `${destination}-${Math.random().toString(36).substring(2, 9)}`

    // Start the subscription process
    wsServiceRef.current
      .connect()
      .then((client) => {
        return wsServiceRef.current!.subscribe(destination, (message) => {
          callback(message)
          setLastMessage({ destination, message })
        })
      })
      .then((subscription) => {
        // Store the subscription
        subscriptionsRef.current[subscriptionId] = subscription
      })
      .catch((error) => {
        console.error(`Failed to subscribe to ${destination}:`, error)
      })

    // Return synchronous unsubscribe function
    return () => {
      if (subscriptionsRef.current[subscriptionId]) {
        subscriptionsRef.current[subscriptionId].unsubscribe()
        delete subscriptionsRef.current[subscriptionId]
      }
    }
  }, [])

  // Send a message to a destination
  const send = useCallback((destination: string, body: any) => {
    if (!wsServiceRef.current) {
      console.error("WebSocketService not initialized")
      return Promise.resolve(false)
    }

    return wsServiceRef.current
      .connect()
      .then((client) => {
        return wsServiceRef
          .current!.send(destination, body)
          .then(() => true)
          .catch((error) => {
            console.error(`Failed to send message to ${destination}:`, error)
            return false
          })
      })
      .catch((error) => {
        console.error("Failed to connect for sending message:", error)
        return false
      })
  }, [])

  return {
    status,
    lastMessage,
    subscribe,
    send,
  }
}
