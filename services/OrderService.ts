// Define the OrderStatus type
export type OrderStatus = "BELUMBAYAR" | "DIPROSES" | "MENCARI" | "DRIVERASSIGNED" | "DIKIRIM" | "DITERIMA" | "DICANCEL"

// Define the Order interface
export interface Order {
  id: string
  restaurantId: string
  restaurantName: string
  restaurantImage?: string
  status: OrderStatus
  orderTime: string
  deliveryAddress: string
  total: number
  estimatedDelivery?: string
  cancelReason?: string
  driver?: {
    name: string
    phone: string
    photo?: string
    vehicleNumber: string
  }
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
}

// Define pagination parameters interface
export interface PaginationParams {
  page: number
  size: number
  sort?: string
}

// Define pagination response interface
export interface PaginatedResponse<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      sorted: boolean
      unsorted: boolean
      empty: boolean
    }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  totalPages: number
  totalElements: number
  last: boolean
  size: number
  number: number
  sort: {
    sorted: boolean
    unsorted: boolean
    empty: boolean
  }
  numberOfElements: number
  first: boolean
  empty: boolean
}

// OrderService class
export default class OrderService {
  private static instance: OrderService
  private baseUrl = "http://localhost:8080/api/v1/transaction/pembeli"

  // Singleton pattern
  private constructor() {}

  public static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService()
    }
    return OrderService.instance
  }

  // Get active orders with pagination
  public async getActiveOrders(pagination: PaginationParams = { page: 0, size: 10 }): Promise<Order[]> {
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        size: pagination.size.toString(),
        status: "ACTIVE",
      })

      if (pagination.sort) {
        queryParams.append("sort", pagination.sort)
      }

      const response = await fetch(`${this.baseUrl}/orders/getall?${queryParams}`)

      if (!response.ok) {
        throw new Error(`Error fetching active orders: ${response.status}`)
      }

      const data: PaginatedResponse<Order> = await response.json()

      // Filter active orders based on status
      return data.content.filter((order) =>
        ["BELUMBAYAR", "DIPROSES", "MENCARI", "DRIVERASSIGNED", "DIKIRIM"].includes(order.status),
      )
    } catch (error) {
      console.error("Failed to fetch active orders:", error)
      throw error
    }
  }

  // Get past orders with pagination
  public async getPastOrders(pagination: PaginationParams = { page: 0, size: 10 }): Promise<Order[]> {
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        size: pagination.size.toString(),
        status: "COMPLETED,CANCELLED",
      })

      if (pagination.sort) {
        queryParams.append("sort", pagination.sort)
      }

      const response = await fetch(`${this.baseUrl}/orders/getall?${queryParams}`)

      if (!response.ok) {
        throw new Error(`Error fetching past orders: ${response.status}`)
      }

      const data: PaginatedResponse<Order> = await response.json()

      // Filter past orders based on status
      return data.content.filter((order) => ["DITERIMA", "DICANCEL"].includes(order.status))
    } catch (error) {
      console.error("Failed to fetch past orders:", error)
      throw error
    }
  }

  // Get all orders with pagination
  public async getAllOrders(pagination: PaginationParams = { page: 0, size: 10 }): Promise<PaginatedResponse<Order>> {
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        size: pagination.size.toString(),
      })

      if (pagination.sort) {
        queryParams.append("sort", pagination.sort)
      }

      const response = await fetch(`${this.baseUrl}/orders/getall?${queryParams}`)

      if (!response.ok) {
        throw new Error(`Error fetching orders: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      throw error
    }
  }

  // Cancel an order
  public async cancelOrder(orderId: string, reason: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      })

      if (!response.ok) {
        throw new Error(`Error cancelling order: ${response.status}`)
      }

      const data = await response.json()
      return data.success
    } catch (error) {
      console.error("Failed to cancel order:", error)
      return false
    }
  }

  // Reorder from a previous order
  public async reorder(orderId: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${orderId}/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error reordering: ${response.status}`)
      }

      const data = await response.json()
      return data.newOrderId
    } catch (error) {
      console.error("Failed to reorder:", error)
      return null
    }
  }

  // Get status display information
  public getStatusDisplay(status: OrderStatus): { label: string; color: string; bgColor: string } {
    switch (status) {
      case "BELUMBAYAR":
        return { label: "Menunggu Pembayaran", color: "text-yellow-600", bgColor: "bg-yellow-50" }
      case "DIPROSES":
        return { label: "Sedang Diproses", color: "text-blue-600", bgColor: "bg-blue-50" }
      case "MENCARI":
        return { label: "Mencari Driver", color: "text-orange-600", bgColor: "bg-orange-50" }
      case "DRIVERASSIGNED":
        return { label: "Driver Ditemukan", color: "text-green-600", bgColor: "bg-green-50" }
      case "DIKIRIM":
        return { label: "Sedang Dikirim", color: "text-indigo-600", bgColor: "bg-indigo-50" }
      case "DITERIMA":
        return { label: "Pesanan Selesai", color: "text-green-600", bgColor: "bg-green-50" }
      case "DICANCEL":
        return { label: "Dibatalkan", color: "text-red-600", bgColor: "bg-red-50" }
      default:
        return { label: "Unknown", color: "text-gray-600", bgColor: "bg-gray-50" }
    }
  }

  // Get status progress percentage
  public getStatusProgress(status: OrderStatus): number {
    switch (status) {
      case "BELUMBAYAR":
        return 10
      case "DIPROSES":
        return 30
      case "MENCARI":
        return 50
      case "DRIVERASSIGNED":
        return 60
      case "DIKIRIM":
        return 80
      case "DITERIMA":
        return 100
      case "DICANCEL":
        return 0
      default:
        return 0
    }
  }

  // Get active step number
  public getActiveStep(status: OrderStatus): number {
    switch (status) {
      case "BELUMBAYAR":
        return 1
      case "DIPROSES":
        return 2
      case "MENCARI":
      case "DRIVERASSIGNED":
        return 3
      case "DIKIRIM":
        return 4
      case "DITERIMA":
        return 5
      default:
        return 0
    }
  }

  // Get total steps in order process
  public getTotalSteps(): number {
    return 5
  }

  // Check if order can be cancelled
  public canCancelOrder(status: OrderStatus): boolean {
    return ["BELUMBAYAR", "DIPROSES", "MENCARI"].includes(status)
  }

  // Check if order can be tracked
  public canTrackOrder(status: OrderStatus): boolean {
    return ["DRIVERASSIGNED", "DIKIRIM"].includes(status)
  }
}
