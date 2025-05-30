import SockJS from "sockjs-client"
import { Client } from "@stomp/stompjs"
import { decryptAESClient } from "./enc"
import Cookies from "js-cookie";
import { getAccessToken } from "./session";


// WebSocket URL based on environment
const WS_URL =
  process.env.NODE_ENV === "development" ? "http://localhost:8080/ws" : "https://api.keeanthebeartian.my.id/ws"

class WebSocketService {
  private static instance: WebSocketService
  private stompClient: Client | null = null
  private connectionPromise: Promise<Client> | null = null
  private subscribers: Map<string, Set<(message: any) => void>> = new Map()

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService()
    }
    return WebSocketService.instance
  }

  public getClient(): Client | null {
    return this.stompClient
  }

  // // Helper method to get the decoded access token
  // private await getAccessToken(): string | null {
  //   const encodedSession = Cookies.get('SNAPEATS_SESSION');
  //   if (!encodedSession) return null
    

  //   try {
  //     const decryptSession = JSON.parse(decryptAESClient(encodedSession))
  //     console.log(decryptSession);
  //     if (!decryptSession.access_token || decryptSession.access_exp < Date.now()) {
  //       console.error("Access token not found in decrypted session");
  //       return null;
  //     }
  //     return window.atob(decryptSession.access_token)
  //   } catch (error) {
  //     console.error("Failed to decode access token:", error)
  //     return null
  //   }
  // }

  public async connect(): Promise<Client> {
    // If already connecting, return the existing promise
    if (this.connectionPromise) {
      return this.connectionPromise
    }

    // If already connected, return the client
    if (this.stompClient && this.stompClient.connected) {
      return Promise.resolve(this.stompClient)
    }

    // Get the access token
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return Promise.reject(new Error("No access token available"))
    }

    // Create a new connection promise
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        // Create SockJS instance with headers
        const socket = new SockJS(WS_URL, null, {
          // Add headers to the SockJS handshake request
          transportOptions: {
            websocket: {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
            xhr: {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          },
        } as any) // Use type assertion to bypass TypeScript checking

        const client = new Client({
          webSocketFactory: () => socket,
          debug: (str) => {
            console.log("STOMP: " + str)
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          // Add headers to the STOMP connect frame
          connectHeaders: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        client.onConnect = () => {
          console.log("WebSocket connected")
          this.stompClient = client
          resolve(client)
        }

        client.onStompError = (frame) => {
          console.error("STOMP error", frame)
          reject(new Error("STOMP error: " + frame.headers.message))
        }

        client.activate()
      } catch (error) {
        console.error("WebSocket connection error:", error)
        this.connectionPromise = null
        reject(error)
      }
    })

    try {
      return await this.connectionPromise
    } catch (error) {
      this.connectionPromise = null
      throw error
    }
  }

  public async subscribe(destination: string, callback: (message: any) => void): Promise<{ unsubscribe: () => void }> {
    try {
      const client = await this.connect()

      // Add to subscribers map
      if (!this.subscribers.has(destination)) {
        this.subscribers.set(destination, new Set())
      }
      this.subscribers.get(destination)?.add(callback)

      // Get the access token for subscription headers
      const accessToken = await getAccessToken()

      const subscription = client.subscribe(
        destination,
        (message) => {
          try {
            const parsedBody = JSON.parse(message.body)
            callback(parsedBody)
          } catch (e) {
            callback(message.body)
          }
        },
        accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      )

      return {
        unsubscribe: () => {
          subscription.unsubscribe()
          // Remove from subscribers map
          this.subscribers.get(destination)?.delete(callback)
        },
      }
    } catch (error) {
      console.error("Failed to subscribe:", error)
      throw error
    }
  }

  public async send(destination: string, body: any): Promise<void> {
    try {
      const client = await this.connect()
      const accessToken = await getAccessToken()

      client.publish({
        destination,
        body: typeof body === "string" ? body : JSON.stringify(body),
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      })
    } catch (error) {
      console.error("Failed to send message:", error)
      throw error
    }
  }

  public disconnect(): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.deactivate()
      this.stompClient = null
    }
    this.connectionPromise = null
    this.subscribers.clear()
  }
}

export default WebSocketService

