import { API_URL } from "@/services/api"

// Types based on your actual API response
export interface OrderDtoPembeli {
  id: string
  totalHarga: number
  statusTransaksi: string
  penjual: PenjualDto
  driver: DriverDto
  detailItems: DetailItemDto[]
  orderTime: string // ISO string from LocalDateTime
}

export interface PenjualDto {
  id: string
  name: string
  noHp: string
}

export interface DriverDto {
  id: string | null
  name: string | null
  noHp: string | null
  vehicleNumber: string | null
}

export interface DetailItemDto {
  name: string
  quantity: number
  harga: number // Note: your API uses 'harga' not 'price'
}

// API Response wrapper - your API returns array directly, not pageable
export interface ResponseDto<T> {
  success: boolean
  message: string
  data: T
}

class OrderService {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_URL || "api.keeanthebeartian.my.id/api/v1/"
  }

  // Get auth token from localStorage or wherever you store it
  private getAuthToken(): string {
    // Replace this with your actual token retrieval logic
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken") || ""
    }
    return ""
  }

  // Get all orders - your API returns all orders in one call, not pageable
  async getAllOrders(page = 0, size = 10): Promise<OrderDtoPembeli[]> {
    try {
      const token = this.getAuthToken()
      if (!token) {
        throw new Error("No authentication token found")
      }

      // Note: Your API doesn't seem to use page/size parameters based on the response
      // But I'll keep them in case you want to implement pagination later
      const response = await fetch(`${this.baseUrl}pembeli/getOrder?page=${page}&size=${size}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ResponseDto<OrderDtoPembeli[]> = await response.json()

      if (result.success) {
        return result.data || []
      } else {
        throw new Error(result.message || "Failed to fetch orders")
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      throw error
    }
  }

  // Get specific order by ID
  async getOrderById(orderId: string): Promise<OrderDtoPembeli> {
    try {
      const token = this.getAuthToken()
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`${this.baseUrl}pembeli/orders/${orderId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ResponseDto<OrderDtoPembeli> = await response.json()

      if (result.success) {
        return result.data
      } else {
        throw new Error(result.message || "Failed to fetch order")
      }
    } catch (error) {
      console.error("Error fetching order:", error)
      throw error
    }
  }

  // Cancel an order
  async cancelOrder(orderId: string, reason?: string): Promise<boolean> {
    try {
      const token = this.getAuthToken()
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`${this.baseUrl}pembeli/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ResponseDto<boolean> = await response.json()
      return result.success
    } catch (error) {
      console.error("Error cancelling order:", error)
      throw error
    }
  }
}

// Export singleton instance
export const orderService = new OrderService()
