import { API_URL } from "./api"
import { getToken } from "./authService"

// Types based on your Java DTO structure
export interface OrderDtoPembeli {
  id: string
  totalHarga: number
  statusTransaksi: string
  penjual: PenjualDto
  driver: DriverDto | null
  detailItems: DetailItemDto[]
  orderTime: string // ISO string from LocalDateTime
}

export interface PenjualDto {
  id: string
  name: string
  noHp: string
}

export interface DriverDto {
  id: string
  name: string
  noHp: string
  vehicleNumber: string
}

export interface DetailItemDto {
  id?: string
  name: string
  quantity: number
  price: number
}

// Pageable response structure
export interface PageableResponse<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  last: boolean
  totalPages: number
  totalElements: number
  size: number
  number: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  first: boolean
  numberOfElements: number
  empty: boolean
}

// API Response wrapper
export interface ResponseDto<T> {
  success: boolean
  message: string
  data: T
}

class OrderService {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_URL||"";
  }

  // Get auth token from localStorage or wherever you store it

  // Get all orders (both active and history) with pagination
  async getAllOrders(page = 0, size = 10): Promise<PageableResponse<OrderDtoPembeli>> {
    try {
      const token = await getToken()
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`${this.baseUrl}pembeli/getOrder?page=${page}&size=${size}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        console.log(response.json())
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ResponseDto<PageableResponse<OrderDtoPembeli>> = await response.json()

      if (result.success) {
        return result.data
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
      const token = await getToken()
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
      const token = await getToken()
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
